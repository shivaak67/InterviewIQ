"""Run migrations against a disposable local database, leaving existing data untouched."""
import os
import subprocess
import sys
import uuid
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from app.core.config import settings
url = make_url(settings.database_url)
if url.host not in ('localhost', '127.0.0.1'):
    raise RuntimeError('Migration smoke tests must use a local database')
name = 'preppilot_migration_' + uuid.uuid4().hex[:10]
engine = create_engine(url.set(database='postgres'), isolation_level='AUTOCOMMIT')
with engine.connect() as connection:
    connection.execute(text(f'CREATE DATABASE {name}'))
test_url = url.set(database=name).render_as_string(hide_password=False)
env = {**os.environ, 'DATABASE_URL': test_url}
subprocess.run([sys.executable, '-m', 'alembic', 'upgrade', 'head'], env=env, check=True)
subprocess.run([sys.executable, '-m', 'alembic', 'check'], env=env, check=True)
print('Fresh local database migrated and matches application models:', name)
