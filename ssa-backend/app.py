from flask import Flask, render_template, url_for, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import yaml

app = Flask(__name__)
db = yaml.load(open("db.yaml"), Loader=yaml.FullLoader)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://{user}:{password}@{host}/{db}'.format(user=db["mysql_user"], password=db["mysql_password"], host=db["mysql_host"], db=db["mysql_db"])

db = SQLAlchemy(app)


class Supervisors(db.Model):
    supervisorID = db.Column(db.Integer, primary_key=True)
    supervisorName = db.Column(db.String(100), nullable=False)
    supervisorEmail = db.Column(db.String(200), nullable=False, unique=True)
    project_keywords = db.Column(db.Text)
    filter_words = db.Column(db.Text)
    def __repr__(self):
        return '<Name %r>' %self.supervisorName
     

@app.route('/')
def index():
    #code for dashboard
    return "todo"

@app.route('/supervisor-profiles', methods=['GET'])
def display_profiles():
    supervisors = Supervisors.query.all()
    output = []
    for supervisor in supervisors:
        supervisor_data = {"name": supervisor.supervisorName, "email": supervisor.supervisorEmail, "projects":supervisor.project_keywords, "filter_words":supervisor.filter_words}
        output.append(supervisor_data)
    return jsonify({"supervisors": output})

@app.route('/supervisor-filters', methods=['GET']) 
def display_filters():
    supervisors = Supervisors.query.all()
    output = []
    filter_list = []
    for supervisor in supervisors:
        unique_filters = supervisor.filter_words.split(',')
        for filters in unique_filters:
            filter_list.append(filters)
    filter_list = list(set(filter_list))
    for item in filter_list:
        output.append(item)
    return jsonify({"allFilters": output})

if __name__ == "__main__":
    app.run(debug=True) #changes are updated immediately - set to False once in production