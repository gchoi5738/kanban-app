import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
  # Flask configuration
  SECRET_KEY = os.environ.get('SECRET_KEY') or 'hard-to-guess-string'

  # SQLAlchemy configuration
  SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
      'postgresql://postgres:postgres@localhost:5432/kanban_db'
  SQLALCHEMY_TRACK_MODIFICATIONS = False

  # CORS configuration
  CORS_HEADERS = 'Content-Type'
