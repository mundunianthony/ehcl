#!/usr/bin/env python3
"""
Simple script to export SQLite data for migration to PostgreSQL.

This script exports your current SQLite data to JSON format
that can be imported into PostgreSQL later.
"""
import os
import sys
import django
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Set up Django with current settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.core.management import call_command
from django.conf import settings

def export_data():
    """Export all data from SQLite to JSON."""
    print("=" * 60)
    print("Exporting SQLite Data for PostgreSQL Migration")
    print("=" * 60)
    
    # Check if SQLite database exists
    db_path = Path('db.sqlite3')
    if not db_path.exists():
        print("❌ No SQLite database found at db.sqlite3")
        print("Nothing to export.")
        return
    
    # Create data directory
    data_dir = Path('data_migration')
    data_dir.mkdir(exist_ok=True)
    
    # Export data to JSON
    fixtures_file = data_dir / 'sqlite_data.json'
    
    try:
        print("📦 Exporting data from SQLite...")
        call_command('dumpdata', 
                    '--natural-foreign', 
                    '--natural-primary',
                    '--exclude', 'contenttypes', 
                    '--exclude', 'auth.Permission',
                    '--indent', '2', 
                    '--output', str(fixtures_file))
        
        print(f"✅ Data exported successfully to: {fixtures_file}")
        
        # Get file size
        file_size = fixtures_file.stat().st_size
        print(f"📊 File size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
        
    except Exception as e:
        print(f"❌ Error exporting data: {e}")
        return
    
    print("\n" + "=" * 60)
    print("Next Steps:")
    print("=" * 60)
    print("1. Deploy to Railway with PostgreSQL")
    print("2. Run: railway run python manage.py migrate")
    print("3. Run: railway run python manage.py loaddata data_migration/sqlite_data.json")
    print("4. Test your application")
    print("\nYour data is ready for migration! 🚀")

if __name__ == '__main__':
    export_data() 