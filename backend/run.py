from app import create_app, db
from app.models import Section, Task

app = create_app()


@app.shell_context_processor
def make_shell_context():
  return {
      'db': db,
      'Section': Section,
      'Task': Task
  }


if __name__ == '__main__':
  app.run(host='0.0.0.0', port=5001)
