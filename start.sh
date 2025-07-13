#!/bin/bash

# Set Django environment to railway
export DJANGO_ENV=railway

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the server
echo "Starting Django server..."
gunicorn myproject.wsgi:application --bind 0.0.0.0:$PORT 