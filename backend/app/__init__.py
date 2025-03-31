from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

# Initialize extensions - these need to be available at module level
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()


def create_app(config_class=Config):
  # Initialize Flask app
  app = Flask(__name__)
  app.config.from_object(config_class)

  # Initialize extensions
  db.init_app(app)
  migrate.init_app(app, db)
  cors.init_app(app, resources={r"/*": {"origins": "*"}})

  # Import models - must be after db init
  from app import models

  # Define and register blueprints here directly to avoid circular imports
  from flask import Blueprint, jsonify, request
  from datetime import datetime
  from app.models import Section, Task
  from werkzeug.http import HTTP_STATUS_CODES

  # Error handling helpers
  def error_response(status_code, message=None):
    payload = {'error': HTTP_STATUS_CODES.get(status_code, 'Unknown error')}
    if message:
      payload['message'] = message
    response = jsonify(payload)
    response.status_code = status_code
    return response

  def bad_request(message):
    return error_response(400, message)

  # Create API blueprint
  api_bp = Blueprint('api', __name__, url_prefix='/api')

  # Register error handlers BEFORE registering the blueprint
  @api_bp.app_errorhandler(404)
  def not_found_error(error):
    return error_response(404)

  @api_bp.app_errorhandler(500)
  def internal_error(error):
    return error_response(500)

  # API Routes
  # Section routes
  @api_bp.route('/sections', methods=['GET'])
  def get_sections():
    sections = Section.query.all()
    return jsonify([section.to_dict() for section in sections])

  @api_bp.route('/sections/<string:id>', methods=['GET'])
  def get_section(id):
    section = Section.query.get_or_404(id)
    return jsonify(section.to_dict())

  @api_bp.route('/sections', methods=['POST'])
  def create_section():
    data = request.get_json() or {}

    if 'name' not in data:
      return bad_request('Name is required')

    section = Section(name=data['name'])
    db.session.add(section)
    db.session.commit()

    return jsonify(section.to_dict()), 201

  @api_bp.route('/sections/<string:id>', methods=['PUT'])
  def update_section(id):
    section = Section.query.get_or_404(id)
    data = request.get_json() or {}

    if 'name' not in data:
      return bad_request('Name is required')

    section.name = data['name']
    db.session.commit()

    return jsonify(section.to_dict())

  @api_bp.route('/sections/<string:id>', methods=['DELETE'])
  def delete_section(id):
    section = Section.query.get_or_404(id)
    db.session.delete(section)
    db.session.commit()

    return '', 204

  # Task routes
  @api_bp.route('/tasks', methods=['GET'])
  def get_tasks():
    # Get query parameters for filtering
    priority = request.args.get('priority')
    date_after = request.args.get('dateAfter')
    assignee = request.args.get('assignee')

    # Start with a base query
    query = Task.query

    # Apply filters if provided
    if priority:
      query = query.filter(Task.priority == priority)

    if date_after:
      try:
        date_after_obj = datetime.fromisoformat(date_after.replace('Z', '+00:00'))
        query = query.filter(Task.date >= date_after_obj)
      except ValueError:
        pass  # Ignore invalid date format

    if assignee:
      query = query.filter(Task.assignee == assignee)

    # Execute the query
    tasks = query.all()

    return jsonify([task.to_dict() for task in tasks])

  @api_bp.route('/tasks/<string:id>', methods=['GET'])
  def get_task(id):
    task = Task.query.get_or_404(id)
    return jsonify(task.to_dict())

  @api_bp.route('/tasks', methods=['POST'])
  def create_task():
    data = request.get_json() or {}

    # Validate required fields
    if 'name' not in data:
      return bad_request('Name is required')

    if 'section' not in data:
      return bad_request('Section is required')

    # Validate section exists
    section = Section.query.get(data['section'])
    if not section:
      return error_response(404, 'Section not found')

    # Parse date if provided
    date = datetime.utcnow()
    if 'date' in data and data['date']:
      try:
        date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
      except ValueError:
        return bad_request('Invalid date format')

    # Create the task
    task = Task(
        name=data['name'],
        description=data.get('description', ''),
        date=date,
        priority=data.get('priority', 'medium'),
        assignee=data.get('assignee', ''),
        section=data['section']
    )

    db.session.add(task)
    db.session.commit()

    return jsonify(task.to_dict()), 201

  @api_bp.route('/tasks/<string:id>', methods=['PUT'])
  def update_task(id):
    task = Task.query.get_or_404(id)
    data = request.get_json() or {}

    # If section is being updated, validate it exists
    if 'section' in data:
      section = Section.query.get(data['section'])
      if not section:
        return error_response(404, 'Section not found')
      task.section = data['section']

    # Update other fields if provided
    if 'name' in data:
      task.name = data['name']

    if 'description' in data:
      task.description = data.get('description', '')

    if 'priority' in data:
      task.priority = data['priority']

    if 'assignee' in data:
      task.assignee = data.get('assignee', '')

    # Parse date if provided
    if 'date' in data and data['date']:
      try:
        task.date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
      except ValueError:
        return bad_request('Invalid date format')

    db.session.commit()

    return jsonify(task.to_dict())

  @api_bp.route('/tasks/<string:id>', methods=['DELETE'])
  def delete_task(id):
    task = Task.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()

    return '', 204

  # Register the blueprint AFTER all routes and handlers have been defined
  app.register_blueprint(api_bp)

  @app.route('/health')
  def health_check():
    return {'status': 'ok'}

  return app
