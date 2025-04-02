#!/usr/bin/env bash
# Install Python dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Collect static files (for WhiteNoise)
python manage.py collectstatic --noinput