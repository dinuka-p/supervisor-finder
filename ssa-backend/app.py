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
from models import db, Supervisors, Users, ActiveSupervisors

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
            "filter_words": filter_list,
            "contact": supervisor.preferredContact,
            "location": supervisor.location
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

        #if user is a supervisor add to active supervisor table
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
        
        #all users added to user table (for password storing)
        newUser = Users(userEmail=email,
                        userPassword=hashed_password,
                        userRole=role,
                        userName=name)
        db.session.add(newUser)
        db.session.commit()
    user = Users.query.filter_by(userEmail=email).first()
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

if __name__ == "__main__":
#     app.run(debug=False, host='0.0.0.0') #changes are updated immediately - set to False once in production

    http_server = WSGIServer(("0.0.0.0", 8088), app)
    print("starting...", flush=True)
    http_server.serve_forever()