release: python manage.py migrate && python manage.py loaddata data_migration/sqlite_data.json
web: gunicorn myproject.wsgi 