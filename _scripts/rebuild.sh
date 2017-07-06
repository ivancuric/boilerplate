#!/bin/bash -ex

### DEVELOPMENT ONLY SCRIPT ###

# CREATE PROJECT DIRECTORIES
mkdir -p log media/uploads

# MIGRATE APPLICATIONS AND INSERT INITIAL DATA
python manage.py makemigrations
python manage.py migrate
python manage.py load_data

# CREATE ADMIN SUPERUSER
python manage.py createsuperuser --email=admin@admin.com
