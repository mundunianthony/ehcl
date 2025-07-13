#!/usr/bin/env python3
"""
Script to help migrate from SQLite to PostgreSQL.

This script will:
1. Export data from SQLite
2. Create a data dump that can be imported to PostgreSQL
3. Provide instructions for the migration
"""
import os
import sys
import django
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings.development')
django.setup()

from django.core.management import call_command
from django.conf import settings

def export_sqlite_data():
    """Export data from SQLite database."""
    print("Exporting data from SQLite database...")
    
    # Create a data directory if it doesn't exist
    data_dir = Path('data_migration')
    data_dir.mkdir(exist_ok=True)
    
    # Export all data to JSON
    fixtures_file = data_dir / 'sqlite_data.json'
    call_command('dumpdata', '--natural-foreign', '--natural-primary', 
                '--exclude', 'contenttypes', '--exclude', 'auth.Permission',
                '--indent', '2', '--output', str(fixtures_file))
    
    print(f"Data exported to: {fixtures_file}")
    return fixtures_file

def create_postgresql_migration_script():
    """Create a script to help with PostgreSQL migration."""
    script_content = '''#!/usr/bin/env python3
"""
PostgreSQL Migration Script

This script helps you migrate from SQLite to PostgreSQL.
Run this after setting up PostgreSQL and updating your settings.
"""

import os
import sys
import django
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Set up Django with PostgreSQL settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings.development')
django.setup()

from django.core.management import call_command
from django.conf import settings

def migrate_to_postgresql():
    """Migrate data to PostgreSQL."""
    print("Starting PostgreSQL migration...")
    
    # 1. Run migrations to create tables
    print("Running migrations...")
    call_command('migrate')
    
    # 2. Load the exported data
    fixtures_file = Path('data_migration/sqlite_data.json')
    if fixtures_file.exists():
        print("Loading data from SQLite export...")
        call_command('loaddata', str(fixtures_file))
        print("Data migration completed successfully!")
    else:
        print("No data file found. Run migrate_to_postgresql.py first.")
    
    # 3. Create a superuser if needed
    print("\\nTo create a superuser, run:")
    print("python manage.py createsuperuser")

if __name__ == '__main__':
    migrate_to_postgresql()
'''
    
    script_file = Path('migrate_to_postgresql.py')
    with open(script_file, 'w') as f:
        f.write(script_content)
    
    print(f"Migration script created: {script_file}")

def main():
    """Main function to handle the migration process."""
    print("=" * 60)
    print("SQLite to PostgreSQL Migration Helper")
    print("=" * 60)
    
    # Check if SQLite database exists
    db_path = Path('db.sqlite3')
    if not db_path.exists():
        print("No SQLite database found. Nothing to migrate.")
        return
    
    # Export data from SQLite
    fixtures_file = export_sqlite_data()
    
    # Create migration script
    create_postgresql_migration_script()
    
    print("\\n" + "=" * 60)
    print("Migration Instructions:")
    print("=" * 60)
    print("1. Set up PostgreSQL database")
    print("2. Update your settings to use PostgreSQL")
    print("3. Run: python migrate_to_postgresql.py")
    print("4. Test your application")
    print("5. Remove SQLite database when confirmed working")
    print("\\nData has been exported to: data_migration/sqlite_data.json")

if __name__ == '__main__':
    main() 