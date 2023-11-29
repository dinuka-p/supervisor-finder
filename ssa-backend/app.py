from flask import Flask, render_template, url_for, jsonify, request
#from flask_sqlalchemy import SQLAlchemy
# from flask_mysqldb import MySQL
# import yaml
from datetime import datetime

app = Flask(__name__)
# app.config['SQLAlchemy_DATABASE_URI'] = 'mysql+pymysql://root:!mYSqlPW@localhost/ssa_supervisors'
# db = yaml.load(open("db.yaml"))
# app.config['MYSQL_HOST'] = db["mysql_host"]
# app.config['MYSQL_USER'] = db["mysql_user"]
# app.config['PASSWORD'] = db["mysql_password"]
# app.config['DB'] = db["mysql_db"]
# #db = SQLAlchemy(app)
# mysql = MySQL(app)


"""class Students(db.model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100, nullable=False))
    email = db.Column(db.String(200),nullable=False, unique=True)
    date_added = db.Column(db.DateTime, default=datetime.now)

    def __repr__(self):
        return '<Name %r>' %self.name """
     

@app.route('/', methods=["GET","POST"])
def index():
    # if request.method == "POST":
    #     supervisorDetails = request.form
    #     name = supervisorDetails["name"]
    #     email = supervisorDetails["email"]
    #     cur = mysql.connection.cursor()
    #     cur.execute("INSERT INTO supervisor_allocation_db(name,email) VALUES(%s,%s)",(name,email))
    #     mysql.connection.commit()
    #     cur.close()
    #     return "success!"
    return render_template('index.html')

@app.route('/supervisor-profiles')
def display_profiles():
    #name = request.json['name']
    #email = request.json['email']
    #return jsonify({"success":"Success post"})
    return {"supervisors": ["supervisor1", "supervisor2", "supervisor3"]}

if __name__ == "__main__":
    app.run(debug=True) #changes are updated immediately - set to False once in production