from flask import Flask, render_template, url_for, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import yaml
#from datetime import datetime

app = Flask(__name__)
db = yaml.load(open("db.yaml"), Loader=yaml.FullLoader)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://{user}:{password}@{host}/{db}'.format(user=db["mysql_user"], password=db["mysql_password"], host=db["mysql_host"], db=db["mysql_db"])

db = SQLAlchemy(app)


class Supervisors(db.Model):
    supervisorID = db.Column(db.Integer, primary_key=True)
    supervisorName = db.Column(db.String(100), nullable=False)
    supervisorEmail = db.Column(db.String(200), nullable=False, unique=True)
    project_keywords = db.Column(db.Text)
    def __repr__(self):
        return '<Name %r>' %self.supervisorName
     

@app.route('/')
def index():
    supervisors = Supervisors.query.all()
    print(supervisors)
    return render_template('index.html', supervisors=supervisors)

@app.route('/supervisor-profiles')
def display_profiles():
    supervisors = Supervisors.query.all()
    output = []
    for supervisor in supervisors:
        supervisor_data = {"name": supervisor.supervisorName, "email": supervisor.supervisorEmail, "projects":supervisor.project_keywords}
        output.append(supervisor_data)
    return jsonify({"supervisors": output})

if __name__ == "__main__":
    app.run(debug=True) #changes are updated immediately - set to False once in production