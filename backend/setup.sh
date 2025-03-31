#!/bin/bash

# Exit on error
set -e

echo "Setting up Kanban App Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed. Please install Python 3 and try again."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip3 is required but not installed. Please install pip3 and try again."
    exit 1
fi

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL client (psql) is required but not installed. Please install PostgreSQL and try again."
    echo "You can download PostgreSQL from https://www.postgresql.org/download/"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

echo "-----------------------------------------------------------"
echo "IMPORTANT: Make sure PostgreSQL is running on your machine."
echo "If you haven't created the kanban_db database yet, please run:"
echo "  createdb kanban_db"
echo "or"
echo "  psql -U postgres -c 'CREATE DATABASE kanban_db;'"
echo "-----------------------------------------------------------"

# Create a simple database setup script
echo "Creating database setup script..."
cat > db_setup.py << 'EOL'
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/kanban_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy and Migrate
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Define models directly here
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Section(db.Model):
    __tablename__ = 'sections'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(64), nullable=False)
    tasks = db.relationship('Task', backref='section_rel', lazy='dynamic', cascade='all, delete-orphan')

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
    # Create all tables
    with app.app_context():
        db.create_all()
        print("All database tables created.")
EOL

# Set up the database
echo "Setting up database tables..."
export FLASK_APP=db_setup.py
python db_setup.py

# Create migrations directory if it doesn't exist
if [ ! -d "migrations" ]; then
    echo "Creating migrations directory..."
    flask db init
fi

# Create seed script
echo "Creating seeding script..."
cat > seed_db.py << 'EOL'
import random
from datetime import datetime, timedelta
from db_setup import app, db, Section, Task

# Seed the database
def seed_database():
    with app.app_context():
        # Clear existing data
        print("Clearing existing data...")
        Task.query.delete()
        Section.query.delete()
        db.session.commit()

        # Create sections
        print("Creating sections...")
        sections = [
            Section(name='To Do'),
            Section(name='Doing'),
            Section(name='Review'),
            Section(name='Done')
        ]
        db.session.add_all(sections)
        db.session.commit()

        # Get section IDs
        section_ids = [section.id for section in sections]

        # Create tasks
        print("Creating tasks...")
        tasks = []
        priorities = ['high', 'medium', 'low']
        assignees = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Emily Davis']

        for i in range(1, 51):  # Create 50 tasks
            now = datetime.utcnow()
            due_date = now + timedelta(days=random.randint(1, 30))

            task = Task(
                name=f'Task {i}',
                description=f'This is the description for Task {i}',
                date=due_date,
                priority=random.choice(priorities),
                assignee=random.choice(assignees),
                section=random.choice(section_ids)
            )
            tasks.append(task)

        db.session.add_all(tasks)
        db.session.commit()

        print(f'Database seeded with {len(sections)} sections and {len(tasks)} tasks.')

if __name__ == '__main__':
    seed_database()
EOL

# Seed the database
echo "Seeding database with initial data..."
python seed_db.py

# Clean up
echo "Cleaning up temporary files..."
rm db_setup.py seed_db.py

echo "Setup complete! You can now run the backend with: python run.py" 