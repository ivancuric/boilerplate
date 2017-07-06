#!/usr/bin/env bash

source /home/deploy/.env/prostoria/bin/activate
source ~/.nvm/nvm.sh

changed_files="$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)"

check_run() {
	echo "$changed_files" | grep --quiet "$1" && eval "$2"
}

echo -e '\033[1;32m>> starting deployment\033[0m'
check_run package.json "yarn install"
check_run gulpfile.js "yarn build"
check_run webpack.config.js "yarn build"
check_run src "yarn build"
pip install -r reqs/base
python manage.py migrate
python manage.py collectstatic --noinput
touch ../conf/uwsgi.ini
echo -e '\033[1;32m>> deployment done ✔\033[0m'
#!/usr/bin/env bash
