from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Define models here directly to avoid import issues
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Section(db.Model):
    __tablename__ = 'sections'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(64), nullable=False)

class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    priority = db.Column(db.String(16), nullable=False, default='medium')
    assignee = db.Column(db.String(64), nullable=True)
    section = db.Column(db.String(36), db.ForeignKey('sections.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

if __name__ == '__main__':
    if not app.config['SQLALCHEMY_DATABASE_URI'].startswith('postgresql:'):
        print("Error: PostgreSQL database URI is not properly configured.")
        exit(1)
    migrate.init_app(app, db)
