from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from uuid import uuid4
from flask_login import UserMixin


db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

class Supervisors(db.Model):
    supervisorID = db.Column(db.Integer, primary_key=True)
    supervisorName = db.Column(db.String(100), nullable=False)
    supervisorEmail = db.Column(db.String(200), nullable=False, unique=True)
    projectKeywords = db.Column(db.Text)
    filterWords = db.Column(db.Text)
    preferredContact = db.Column(db.Text)
    location = db.Column(db.String(50))
    def __repr__(self):
        return "<Name %r>" %self.supervisorName
    
class Users(UserMixin, db.Model):
    userID = db.Column(db.Integer, primary_key=True)
    userName = db.Column(db.String(100), nullable=False)
    userEmail = db.Column(db.String(200), nullable=False, unique=True)
    userPassword = db.Column(db.Text)
    userRole = db.Column(db.String(60))

    def get_id(self):
        return str(self.userID)
    
    def __repr__(self):
        return "<Name %r>" %self.userName