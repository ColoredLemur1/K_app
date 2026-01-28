#!/bin/bash
# Script to test Neon database connection
# Run this in WSL: bash test_db_connection.sh

cd "$(dirname "$0")"
source venv/bin/activate

echo "Testing database connection..."
python manage.py check --database default

if [ $? -eq 0 ]; then
    echo "✓ Database connection successful!"
    echo ""
    echo "Running migrations..."
    python manage.py makemigrations
    python manage.py migrate
    echo ""
    echo "✓ Migrations completed!"
else
    echo "✗ Database connection failed. Please check your .env file."
    exit 1
fi

