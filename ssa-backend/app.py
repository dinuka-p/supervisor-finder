from gevent import monkey
monkey.patch_all()

import json
from flask import Flask, send_file, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

from datetime import datetime, timedelta, timezone
import pandas as pd
from io import BytesIO
from gevent.pywsgi import WSGIServer
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
from flask_login import LoginManager, login_user, login_required, logout_user, current_user

import os
from dotenv import load_dotenv
load_dotenv()


from flask_cors import CORS


from config import config
from models import db, Supervisors, Users, ActiveSupervisors, Preferences

# DB_SERVER = 'fyp-db.mysql.database.azure.com'
# DB_USER = 'dinuka'
# DB_PASSWORD = os.getenv('DB_PW')
# DB_NAME = 'supervisor_finder_db'

app = Flask(__name__)

#for dev
mysqlDB = config
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://{user}:{password}@{host}/{db}".format(user=mysqlDB["mysql_user"], password=mysqlDB["mysql_password"], host=mysqlDB["mysql_host"], db=mysqlDB["mysql_db"])

#app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?charset=utf8mb4'
app.secret_key = config["secret_key"]

db.init_app(app)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

#when i create new tables, run these commands
# with app.app_context():
#     db.create_all()

    
@login_manager.user_loader
def user_loader(user_id):
    return Users.query.get(int(user_id))

@app.route("/")
def index():
    return "Hello World! This is the backend"

@app.route("/api/supervisor-profiles", methods=["GET"])
def display_profiles():
    supervisors = Supervisors.query.all()
    output = []
    for supervisor in supervisors:
        supervisor_data = {"id":supervisor.supervisorID,"name": supervisor.supervisorName, "email": supervisor.supervisorEmail, "projects":supervisor.projectKeywords, "filter_words":supervisor.filterWords}
        output.append(supervisor_data)
    return jsonify({"supervisors": output})

@app.route("/api/active-supervisor-profiles", methods=["GET"])
def display_active_profiles():
    supervisors = ActiveSupervisors.query.all()
    output = []
    for supervisor in supervisors:
        supervisor_data = {"id":supervisor.supervisorID,"name": supervisor.supervisorName, "email": supervisor.supervisorEmail, "projects":supervisor.bio, "filter_words":supervisor.filterWords}
        output.append(supervisor_data)
    return jsonify({"supervisors": output})

@app.route("/api/supervisor-filters", methods=["GET"]) 
def display_filters():
    supervisors = Supervisors.query.all()
    output = []
    filter_list = []
    for supervisor in supervisors:
        unique_filters = supervisor.filterWords.split(",")
        for filters in unique_filters:
            filter_list.append(filters)
    filter_list = list(set(filter_list))
    for item in filter_list:
        output.append(item)
    return jsonify({"allFilters": output})

@app.route("/api/supervisor-details/<int:id>", methods=["GET"])
def display_supervisor_details(id):
    supervisor = Supervisors.query.get(id)
    filter_list = []
    if supervisor:
        unique_filters = supervisor.filterWords.split(",")
        for filters in unique_filters:
            filter_list.append(filters)
        supervisor_data = {
            "id": supervisor.supervisorID,
            "name": supervisor.supervisorName,
            "email": supervisor.supervisorEmail,
            "projects": supervisor.projectKeywords,
            "examples": "Link to project examples folder",
            "filter_words": filter_list,
            "contact": supervisor.preferredContact,
            "location": supervisor.location,
            "officeHours": "",
            "capacity": "X",
            "bookingLink": ""
        }
        return jsonify({"supervisor_info": supervisor_data})
    else:
        return jsonify({"error": "Supervisor not found"}), 404
    
@app.route("/api/active-supervisor-details/<int:id>", methods=["GET"])
def display_active_supervisor_details(id):
    supervisor = ActiveSupervisors.query.get(id)
    filter_list = []
    if supervisor:
        unique_filters = supervisor.filterWords.split(",")
        for filters in unique_filters:
            filter_list.append(filters)
        supervisor_data = {
            "id": supervisor.supervisorID,
            "name": supervisor.supervisorName,
            "email": supervisor.supervisorEmail,
            "projects": supervisor.bio,
            "examples": supervisor.projectExamples,
            "filter_words": filter_list,
            "contact": supervisor.preferredContact,
            "location": supervisor.location,
            "officeHours": supervisor.officeHours,
            "capacity": supervisor.capacity,
            "bookingLink": supervisor.bookingLink
            
        }
        return jsonify({"supervisor_info": supervisor_data})
    else:
        return jsonify({"error": "Supervisor not found"}), 404
    
@app.route("/api/download-supervisor-table")
def download_supervisor_table():
    query = Supervisors.query.with_entities(Supervisors.supervisorName, Supervisors.supervisorEmail, Supervisors.projectKeywords, Supervisors.filterWords, Supervisors.preferredContact, Supervisors.location).all()
    data = [dict(zip(Supervisors.__table__.columns.keys()[1:], row)) for row in query]    
    df = pd.DataFrame(data)
    output = BytesIO()
    df.to_excel(output, index=False, sheet_name='Supervisors')
    output.seek(0)
    response = send_file(
        output,
        as_attachment=True,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        download_name='supervisors.xlsx'
    )
    response.headers['Content-Disposition'] = 'attachment; filename="supervisors.xlsx"'
    return response

@app.route("/api/register", methods=["POST"])
def register_user():
    request_data = request.get_json()
    email = request_data["email"]
    
    role = request_data["role"]
    name = request_data["name"]
    cursor = db.session.connection()
    query = text("SELECT * FROM Users WHERE userEmail = :email")
    account = cursor.execute(query, {"email": email}).fetchone()
    if account:
        return jsonify({"response": 409})
    else:
        password = request_data["password"]
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        #all users added to user table (for password storing)
        newUser = Users(userEmail=email,
                        userPassword=hashed_password,
                        userRole=role,
                        userName=name)
        db.session.add(newUser)
        db.session.commit()

        user = Users.query.filter_by(userEmail=email).first()
        #students and supervisors added to preferences table
        if user.userRole != "Guest":
            newPreferenceUser = Preferences(userEmail=email)
            db.session.add(newPreferenceUser)
            db.session.commit()

            #supervisors also added to active supervisor table
            if role == "Supervisor":
                activeSupervisor = ActiveSupervisors(supervisorEmail=email,
                                supervisorName=name, 
                                preferredContact= "", 
                                location= "", 
                                officeHours= "", 
                                bookingLink= "", 
                                bio= "", 
                                projectExamples= "", 
                                filterWords= "", 
                                capacity= 0)
                db.session.add(activeSupervisor)
                db.session.commit()

    cursor.close()
    login_user(user)
    accessToken = create_access_token(identity=email)
    return jsonify({"response": 200, "name": name, "role": role, "accessToken": accessToken})

@app.route("/api/login", methods=["POST"])
def login():
    request_data = request.get_json()
    email = request_data["email"]
    password = request_data["password"]

    user = Users.query.filter_by(userEmail=email).first()
    if user and bcrypt.check_password_hash(user.userPassword, password):
        login_user(user)
        accessToken = create_access_token(identity=email)
        return jsonify({"response": 200, "name":user.userName, "role": user.userRole, "accessToken": accessToken})
    else:
        return jsonify({"response": 401})

@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            accessToken = create_access_token(identity = get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = accessToken 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        #return original response if not valid JWT
        return response
    
@app.route("/api/logout", methods=["POST"])
def logout():
    response = jsonify({"response": "logout successful"})
    unset_jwt_cookies(response)
    return response
 
@app.route('/api/user-profile/<getemail>')
@jwt_required() 
def my_profile(getemail):
    if not getemail:
        return jsonify({"error": "Unauthorized Access"}), 401
    user = Users.query.filter_by(userEmail=getemail).first()
    response_body = {
        "id": user.userID,
        "name": user.userName,
        "email": user.userEmail
    }
    return response_body

@app.route('/api/supervisor-profile/<getemail>')
@jwt_required() 
def supervisor_profile(getemail):
    if not getemail:
        return jsonify({"error": "Unauthorized Access"}), 401
    supervisor = ActiveSupervisors.query.filter_by(supervisorEmail=getemail).first()
    filters_list = [tag.strip() for tag in supervisor.filterWords.split(',')]
    response_body = {
        "bio": supervisor.bio,
        "location": supervisor.location,
        "contact": supervisor.preferredContact,
        "officeHours": supervisor.officeHours,
        "booking": supervisor.bookingLink,
        "examples": supervisor.projectExamples,
        "capacity": supervisor.capacity,
        "selectedFilters": filters_list
    }
    return response_body

@app.route("/api/student-profiles", methods=["GET"])
def display_students():
    students = Users.query.filter_by(userRole='Student').all()
    output = []
    for student in students:
        student_data = {"id":student.userID,"name": student.userName, "email": student.userEmail, "bio":student.userBio}
        output.append(student_data)
    return jsonify({"students": output})

@app.route("/api/student-details/<int:id>", methods=["GET"])
def display_student_details(id):
    student = Users.query.get(id)
    filter_list = []
    if student:
        student_data = {
            "id": student.userID,
            "name": student.userName,
            "email": student.userEmail,
            "bio": student.userBio
        }
        return jsonify({"student_info": student_data})
    else:
        return jsonify({"error": "Student not found"}), 404
    
@app.route("/api/check-student-favourites/<studentEmail>/<supervisorEmail>", methods=["GET"])
def check_student_favourites(studentEmail, supervisorEmail):
    message = "user not in database"
    user = Users.query.filter_by(userEmail=studentEmail).first()
    if user:
        if user.favourites is None:
            message = "removed"
        else:
            favourites_list = user.favourites.split(",")
            if supervisorEmail in favourites_list:
                message = "added"
            else:
                message = "removed"
        return jsonify({"response": 200, "message": message})
    else:
        return jsonify({"response": 401, "message": message})
    
@app.route("/api/manage-student-favourites", methods=["POST"])
def manage_student_favourites():
    request_data = request.get_json()
    studentEmail = request_data["studentEmail"]
    supervisorEmail = request_data["supervisorEmail"]
    message = "user not in database"
    favourites_list = []
    user = Users.query.filter_by(userEmail=studentEmail).first()
    if user:
        if user.favourites is None:
            favourites_list.append(supervisorEmail)
            message = "added"
        else:
            favourites_list = user.favourites.split(",")

            if supervisorEmail in favourites_list:
                #remove supervisor from the list
                favourites_list.remove(supervisorEmail)
                message = "removed"
            else:
                #add supervisor to the list
                favourites_list.append(supervisorEmail)
                message = "added"
        user.favourites = ",".join(favourites_list)
        db.session.commit()
        return jsonify({"response": 200, "message": message})
    else:
        return jsonify({"response": 401, "message": message})

@app.route("/api/check-supervisor-favourites/<supervisorEmail>/<studentEmail>", methods=["GET"])
def check_supervisor_favourites(supervisorEmail, studentEmail):
    message = "user not in database"
    user = Users.query.filter_by(userEmail=supervisorEmail).first()
    if user:
        if user.favourites is None:
            message = "removed"
        else:
            favourites_list = user.favourites.split(",")
            if studentEmail in favourites_list:
                message = "added"
            else:
                message = "removed"
        return jsonify({"response": 200, "message": message})
    else:
        return jsonify({"response": 401, "message": message})
    
@app.route("/api/manage-supervisor-favourites", methods=["POST"])
def manage_supervisor_favourites():
    request_data = request.get_json()
    supervisorEmail = request_data["supervisorEmail"]
    studentEmail = request_data["studentEmail"]
    message = "user not in database"
    favourites_list = []
    user = Users.query.filter_by(userEmail=supervisorEmail).first()
    if user:
        if user.favourites is None:
            favourites_list.append(studentEmail)
            message = "added"
        else:
            favourites_list = user.favourites.split(",")

            if studentEmail in favourites_list:
                #remove supervisor from the list
                favourites_list.remove(studentEmail)
                message = "removed"
            else:
                #add supervisor to the list
                favourites_list.append(studentEmail)
                message = "added"
        user.favourites = ",".join(favourites_list)
        db.session.commit()
        return jsonify({"response": 200, "message": message})
    else:
        return jsonify({"response": 401, "message": message})
    
@app.route("/api/get-favourites/<userEmail>", methods=["GET"])
def get_favourites(userEmail):
    user = Users.query.filter_by(userEmail=userEmail).first()
    favourites_list = []
    if user:
        unique_favourites = user.favourites.split(",")
        for favourites in unique_favourites:
            user = Users.query.filter_by(userEmail=favourites).first()
            favourite_details = {"name": user.userName, "email": user.userEmail}
            favourites_list.append(favourite_details)
        return jsonify({"favourites": favourites_list})
    else:
        return jsonify({"error": "User not found"}), 404
    
@app.route("/api/submit-preferences", methods=["POST"])
def submit_preferences():
    request_data = request.get_json()
    userEmail = request_data["userEmail"]
    preferences = request_data["preferred"]
    user = Preferences.query.filter_by(userEmail=userEmail).first() #all students and supervisors added to Preferences when they register
    serialized_list = json.dumps(preferences)
    if user: 
        user.submittedPreferences = serialized_list
        db.session.commit()
    return jsonify({"response": 200})

@app.route("/api/edit-profile", methods=["POST"])
def edit_profile():
    request_data = request.get_json()

    email = request_data["email"]
    bio = request_data["bio"]
    location = request_data["location"]
    contact = request_data["contact"]
    officeHours = request_data["officeHours"]
    booking = request_data["booking"]
    examples = request_data["examples"]
    capacity = request_data["capacity"]
    selectedFilters = request_data["selectedFilters"]

    cursor = db.session.connection()
    user = Users.query.filter_by(userEmail=email).first()
    if user:
        #students and supervisors added to preferences table
        if user.userRole == "Student":
            user.userBio = bio
            db.session.commit()

        if user.userRole == "Supervisor":
            supervisor = ActiveSupervisors.query.filter_by(supervisorEmail=email).first()
            supervisor.bio = bio
            supervisor.preferredContact = contact
            supervisor.location = location
            supervisor.officeHours = officeHours
            supervisor.bookingLink = booking
            supervisor.projectExamples = examples
            filterWords = ', '.join(selectedFilters)
            supervisor.filterWords = filterWords
            supervisor.capacity = capacity
            db.session.commit()

    cursor.close()
    return jsonify({"response": 200})
        

if __name__ == "__main__":
#     app.run(debug=False, host='0.0.0.0') #changes are updated immediately - set to False once in production

    http_server = WSGIServer(("0.0.0.0", 8088), app)
    print("starting...", flush=True)
    http_server.serve_forever()