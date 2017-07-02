#!/bin/bash
source /home/deploy/.virtualenvs/42.2/bin/activate

changed_files="$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)"

check_run() {
        echo "$changed_files" | grep --quiet "$1" && eval "$2"
}

echo ">> starting deployment"
check_run requirements.txt "pip install -r requirements.txt"
check_run package.json "yarn install"
check_run src "yarn run build"
check_run migrations "python manage.py migrate"
check_run src "python manage.py collectstatic --noinput"
touch scripts/uwsgi.ini
echo ">> deployment ended"
