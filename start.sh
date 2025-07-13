#!/bin/bash

# Set Django environment to railway
export DJANGO_ENV=railway

# Print environment info
echo "=================================================="
echo "RAILWAY DEPLOYMENT STARTUP"
echo "=================================================="
echo "DJANGO_ENV: $DJANGO_ENV"
echo "DATABASE: $PGDATABASE"
echo "HOST: $PGHOST"
echo "=================================================="

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the server
echo "Starting Django server..."
gunicorn myproject.wsgi:application --bind 0.0.0.0:$PORT 