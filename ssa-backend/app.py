from gevent import monkey
monkey.patch_all()

import json
from flask import Flask, send_file, jsonify, request

from datetime import datetime, timedelta, timezone
import pandas as pd
from io import BytesIO
from gevent.pywsgi import WSGIServer
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
from flask_login import LoginManager, login_user, login_required, logout_user, current_user

from config import config
from models import db, Supervisors, Users

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://{user}:{password}@{host}/{db}".format(user=config["mysql_user"], password=config["mysql_password"], host=config["mysql_host"], db=config["mysql_db"])
app.secret_key = config["secret_key"]

db.init_app(app)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


    
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

        newUser = Users(userEmail=email,
                userPassword=hashed_password,
                userRole=role,
                userName=name)
        db.session.add(newUser)
        db.session.commit()
    cursor.close()
    return jsonify({"response": 200})

@app.route("/api/login", methods=["POST"])
def login():
    request_data = request.get_json()
    email = request_data["email"]
    password = request_data["password"]

    user = Users.query.filter_by(userEmail=email).first()
    if user and bcrypt.check_password_hash(user.userPassword, password):
        login_user(user)
        accessToken = create_access_token(identity=email)
        return jsonify({"response": 200, "role": user.userRole, "accessToken": accessToken})
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

if __name__ == "__main__":
#     app.run(debug=False, host='0.0.0.0') #changes are updated immediately - set to False once in production

    http_server = WSGIServer(("0.0.0.0", 8088), app)
    print("starting...", flush=True)
    http_server.serve_forever()