# Neon Database Setup Instructions

## Prerequisites
- ✅ psycopg2-binary is installed
- ✅ Django settings configured for Neon
- ✅ .gitignore created to protect .env file

## Steps to Complete

### 1. Configure .env File
Make sure your `server/.env` file contains your Neon database credentials:

```bash
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=your-project.neon.tech
DB_PORT=5432
```

**To get these values from your Neon connection string:**
If your connection string is: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`

- `DB_NAME` = `dbname`
- `DB_USER` = `user`
- `DB_PASSWORD` = `password`
- `DB_HOST` = `host.neon.tech`
- `DB_PORT` = `5432` (default)

### 2. Test Database Connection (Run in WSL)
```bash
cd server
source venv/bin/activate
python manage.py check --database default
```

### 3. Run Migrations (Run in WSL)
```bash
# Create migration files
python manage.py makemigrations

# Apply migrations to Neon database
python manage.py migrate
```

### 4. Verify Setup (Run in WSL)
```bash
# Test connection in Django shell
python manage.py shell
# Then type: from django.db import connection; print(connection.ensure_connection())
# Exit with: exit()
```

### 5. Create Admin Superuser (Optional, Run in WSL)
```bash
python manage.py createsuperuser
```

## Quick Test Script
You can also use the provided test script:
```bash
cd server
bash test_db_connection.sh
```

## Troubleshooting

**Connection refused:**
- Verify Neon project is active (not paused)
- Check that your .env file has correct credentials
- Ensure SSL mode is set to 'require' (already configured)

**Authentication errors:**
- Double-check username and password in .env
- Verify connection string format

**Module not found errors:**
- Make sure virtual environment is activated: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`

