#!/bin/bash
# Test Postgres (or SQLite) connection from .env DATABASE_URL.
# Run from Git Bash/WSL: bash test_db_connection.sh

cd "$(dirname "$0")"
# shellcheck source=/dev/null
source venv/Scripts/activate 2>/dev/null || source venv/bin/activate

echo "Testing database connection..."
python manage.py check --database default

if [ $? -eq 0 ]; then
    echo "Database connection successful."
    echo ""
    echo "Running migrations..."
    python manage.py migrate
    echo ""
    echo "Migrations completed."
else
    echo "Database connection failed. Check server/.env (DATABASE_URL)."
    exit 1
fi
