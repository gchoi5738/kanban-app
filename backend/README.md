# Kanban App Backend

A lightweight Flask backend for the Kanban app, with PostgreSQL database integration.

## Features

- RESTful API for Kanban board sections and tasks
- PostgreSQL database for data persistence
- Filter tasks by priority, due date, and assignee
- Validation and error handling
- CORS support for frontend integration

## Setup and Installation

### Prerequisites

- Python 3.8 or higher
- PostgreSQL 14 or higher
- Docker and Docker Compose (optional, for running PostgreSQL)

### Running with Docker Compose

1. Start the PostgreSQL database:
   ```
   docker-compose up -d postgres
   ```

2. Install Python dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

3. Initialize the database:
   ```
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

4. Seed the database with initial data:
   ```
   python seed.py
   ```

5. Run the backend:
   ```
   python run.py
   ```

The API will be available at http://localhost:5000/api

## API Endpoints

### Sections

- `GET /api/sections`: Get all sections
- `GET /api/sections/:id`: Get a specific section
- `POST /api/sections`: Create a new section
- `PUT /api/sections/:id`: Update a section
- `DELETE /api/sections/:id`: Delete a section

### Tasks

- `GET /api/tasks`: Get all tasks (with optional filters)
- `GET /api/tasks/:id`: Get a specific task
- `POST /api/tasks`: Create a new task
- `PUT /api/tasks/:id`: Update a task
- `DELETE /api/tasks/:id`: Delete a task

## Filtering Tasks

Tasks can be filtered using query parameters:

- `priority`: Filter by priority ('high', 'medium', 'low')
- `dateAfter`: Filter tasks due after a specific date (ISO format)
- `assignee`: Filter by assignee name

Example: `GET /api/tasks?priority=high&dateAfter=2023-04-01`

## Development

### Flask Shell

You can use Flask shell for testing and development:

```
flask shell
```

This will provide access to the database models and other app components. 