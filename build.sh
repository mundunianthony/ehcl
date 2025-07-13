#!/bin/bash

# Build script for Railway deployment

echo "Starting build process..."

# Set Django environment
export DJANGO_ENV=railway

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Run database migrations
echo "Running database migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if it doesn't exist (optional)
echo "Build process completed!" 