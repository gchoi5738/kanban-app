import random
from datetime import datetime, timedelta
from app.models import Section, Task


def seed_database():
  # Clear existing data
  print("Clearing existing data...")
  Task.query.delete()
  Section.query.delete()

  # Create sections
  print("Creating sections...")
  sections = [
      Section(name='To Do'),
      Section(name='Doing'),
      Section(name='Review'),
      Section(name='Done')
  ]
  from app import db
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
  print("This script should be run through setup.sh or with flask context.")
  print("Run: python -c 'from app import create_app, db; from seed import seed_database; app = create_app(); app.app_context().push(); seed_database()'")
