from flask import Flask, send_file, jsonify
from flask_sqlalchemy import SQLAlchemy
import pandas as pd
from io import BytesIO
import yaml

app = Flask(__name__)
mysqlDB = yaml.load(open("db.yaml"), Loader=yaml.FullLoader)
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://{user}:{password}@{host}/{db}".format(user=mysqlDB["mysql_user"], password=mysqlDB["mysql_password"], host=mysqlDB["mysql_host"], db=mysqlDB["mysql_db"])

db = SQLAlchemy(app)


class Supervisors(db.Model):
    supervisorID = db.Column(db.Integer, primary_key=True)
    supervisorName = db.Column(db.String(100), nullable=False)
    supervisorEmail = db.Column(db.String(200), nullable=False, unique=True)
    project_keywords = db.Column(db.Text)
    filter_words = db.Column(db.Text)
    preferred_contact = db.Column(db.Text)
    location = db.Column(db.String(50))
    def __repr__(self):
        return "<Name %r>" %self.supervisorName
     

@app.route("/")
def index():
    #code for dashboard
    return "todo"

@app.route("/supervisor-profiles", methods=["GET"])
def display_profiles():
    supervisors = Supervisors.query.all()
    output = []
    for supervisor in supervisors:
        supervisor_data = {"id":supervisor.supervisorID,"name": supervisor.supervisorName, "email": supervisor.supervisorEmail, "projects":supervisor.project_keywords, "filter_words":supervisor.filter_words}
        output.append(supervisor_data)
    return jsonify({"supervisors": output})

@app.route("/supervisor-filters", methods=["GET"]) 
def display_filters():
    supervisors = Supervisors.query.all()
    output = []
    filter_list = []
    for supervisor in supervisors:
        unique_filters = supervisor.filter_words.split(",")
        for filters in unique_filters:
            filter_list.append(filters)
    filter_list = list(set(filter_list))
    for item in filter_list:
        output.append(item)
    return jsonify({"allFilters": output})

@app.route("/supervisor-details/<int:id>", methods=["GET"])
def display_supervisor_details(id):
    supervisor = Supervisors.query.get(id)
    filter_list = []
    if supervisor:
        unique_filters = supervisor.filter_words.split(",")
        for filters in unique_filters:
            filter_list.append(filters)
        supervisor_data = {
            "id": supervisor.supervisorID,
            "name": supervisor.supervisorName,
            "email": supervisor.supervisorEmail,
            "projects": supervisor.project_keywords,
            "filter_words": filter_list,
            "contact": supervisor.preferred_contact,
            "location": supervisor.location
        }
        return jsonify({"supervisor_info": supervisor_data})
    else:
        return jsonify({"error": "Supervisor not found"}), 404
    
@app.route("/download-supervisor-table")
def download_supervisor_table():
    query = Supervisors.query.with_entities(Supervisors.supervisorName, Supervisors.supervisorEmail, Supervisors.project_keywords, Supervisors.filter_words, Supervisors.preferred_contact, Supervisors.location).all()
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

if __name__ == "__main__":
    app.run(debug=False) #changes are updated immediately - set to False once in production