# Kanban App

A comprehensive Kanban board application built with React Native (Expo for web) and Flask with a local database. This app allows users to manage tasks across different stages of completion with a smooth drag-and-drop interface.

## Development Process & Time Breakdown

### Planning and Initial Setup (30 minutes)
- Project structure planning
- Setting up React Native with Expo
- Configuring TypeScript and essential dependencies

### Core UI Components (1 hour)
- KanbanBoardScreen implementation
- SectionColumn component
- TaskCard component with animations
- Basic drag and drop functionality

### Task Management Features (45 minutes)
- Task creation modal
- Task detail view
- Edit and delete functionality
- Metadata handling (priority, dates, assignees)

### Backend Development (45 minutes)
- Flask API setup
- Database models and migrations
- API endpoints implementation
- CORS configuration

### Advanced Features (1 hour)
- Drag and drop animations
- Responsive design implementation
- Filter system
- Performance optimizations

### Testing and Refinement (30 minutes)
- Bug fixes
- UI polish
- Documentation

Total Development Time: ~4 hours

## Design Choices & Technical Decisions

### Frontend Architecture
1. **React Native + Expo Web**
   - Chose Expo for rapid development and web deployment
   - Enables future mobile deployment without code changes
   - Provides excellent development tools and hot reloading

2. **State Management**
   - React Query for server state management
   - Local state for UI components
   - Optimistic updates for better UX

3. **UI Components**
   - Custom components for better control over styling and animations
   - Responsive design using Flexbox
   - Modular component structure for reusability

### Backend Architecture
1. **Flask + SQLite**
   - Lightweight and easy to set up
   - Suitable for demonstration purposes
   - SQLite for simple data persistence without external dependencies

2. **API Design**
   - RESTful endpoints for CRUD operations
   - Simple authentication-free design for demo purposes
   - CORS enabled for local development

### Alternative Approaches Considered

1. **Frontend Alternatives**
   - Pure React.js: Simpler but less portable to mobile
   - Next.js: Better for production but overhead for demo
   - Redux: Considered but React Query sufficient for demo

2. **Backend Alternatives**
   - Express.js: Familiar but Python better for quick setup
   - Firebase: Good but overkill for demo
   - MongoDB: Considered but SQLite simpler for demo

3. **State Management Alternatives**
   - Redux: Too heavy for current needs
   - MobX: Good but React Query better for API data
   - Context API: Used sparingly for theme/global state

## Features

- **Configurable Sections**: Tasks can be moved between different configurable stages
- **Drag and Drop**: Intuitive drag and drop with smooth animations
- **Task Management**: Create, edit, and delete tasks with detailed metadata
- **Metadata Filtering**: Filter tasks by priority, due date, and assignee
- **Responsive Design**: Optimized for both portrait and landscape
- **Persistent Storage**: Backend database for reliable data storage
- **RESTful API**: Well-structured API for all operations

## Quick Setup Guide

### Prerequisites
- Node.js (v14 or later)
- Python 3.8 or later
- npm or yarn
- Chrome (recommended)

### One-Time Setup

1. **Clone and Install Dependencies**
```bash
# Clone the repository
git clone <repository-url>
cd kanban-app

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

### Database Setup (PostgreSQL)

1. **Install PostgreSQL**
```bash
# macOS (using Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

2. **Create Database and User**
```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE kanban;
CREATE USER kanban_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kanban TO kanban_user;
```

3. **Environment Configuration**
Create a `.env` file in the backend directory:
```bash
# backend/.env
DATABASE_URL=postgresql://kanban_user:your_password@localhost:5432/kanban
FLASK_ENV=development
FLASK_APP=app.py
FLASK_DEBUG=1
```

4. **Initialize Database Schema**
```bash
# In the backend directory
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

5. **Seed Initial Data**
```bash
# In the backend directory
python -c 'from app import create_app, db; from seed import seed_database; app = create_app(); app.app_context().push(); seed_database()'
```

This will create:
- 4 default sections (To Do, Doing, Review, Done)
- 50 sample tasks distributed across these sections

6. **Verify Connection**
```bash
# Using psql
psql -U kanban_user -d kanban -h localhost

# Or in Python shell
python -c "from app import db; print(db.engine.connect())"
```

The PostgreSQL database will store:
- Tasks (id, title, description, priority, due_date, assignee, section_id)
- Sections (id, title, order)
- Indexes on frequently queried fields
- Foreign key constraints for data integrity

**Note**: Make sure to add `.env` to your `.gitignore` file to keep sensitive information secure.

2. **Start the Application**
```bash
# Terminal 1: Start backend
cd backend
python -m flask run --port=5001

# Terminal 2: Start frontend
cd kanban-app
npx expo start --web
```

The app will open in your browser at http://localhost:8081

### Troubleshooting Common Issues

1. **Backend Issues**
   - "No module named flask": Run `pip install flask`
   - "Address in use": Change port in Flask command
   - Database errors: Check permissions in backend/instance
   - Cannot create tasks: Ensure database is seeded by running the command in step 5 of Database Setup
   - Empty sections list: Database needs to be seeded with initial data

2. **Frontend Issues**
   - Module errors: Run `npm install`
   - White screen: Check console and retry with `--clear`
   - API connection: Verify backend is running on port 5001

## API Reference

### Tasks
- `GET /api/tasks`: Get all tasks
- `POST /api/tasks`: Create task
- `PUT /api/tasks/:id`: Update task
- `DELETE /api/tasks/:id`: Delete task

### Sections
- `GET /api/sections`: Get all sections

## Future Enhancements

1. **Planned Features**
   - User authentication
   - Real-time updates
   - Mobile app deployment
   - Advanced filtering
   - Calendar integration

2. **Technical Improvements**
   - Unit and E2E tests
   - CI/CD pipeline
   - Production database
   - Performance monitoring
   - Error tracking

## License

This project is licensed under the MIT License.

## Acknowledgments

- React Native and Expo
- Flask framework
- React Query
- React Native Drax