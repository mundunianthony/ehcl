release: python manage.py migrate && python manage.py loaddata data_migration/data.json
web: gunicorn myproject.wsgi 