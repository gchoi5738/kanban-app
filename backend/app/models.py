from datetime import datetime
import uuid
from app import db


def generate_uuid():
  return str(uuid.uuid4())


class Section(db.Model):
  __tablename__ = 'sections'

  id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
  name = db.Column(db.String(64), nullable=False)

  # Relationship
  tasks = db.relationship('Task', backref='section_rel', lazy='dynamic', cascade='all, delete-orphan')

  def to_dict(self):
    return {
        'id': self.id,
        'name': self.name
    }


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

  def to_dict(self):
    return {
        'id': self.id,
        'name': self.name,
        'description': self.description or '',
        'date': self.date.isoformat(),
        'priority': self.priority,
        'assignee': self.assignee or '',
        'section': self.section,
        'createdAt': self.created_at.isoformat(),
        'updatedAt': self.updated_at.isoformat()
    }
