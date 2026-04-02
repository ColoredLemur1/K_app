# Local PostgreSQL (Docker)

The API uses **`DATABASE_URL`** for Postgres. If it is unset, Django falls back to **SQLite** (`server/db.sqlite3`).

## 1. Start Postgres

From the **repository root** (where `docker-compose.yml` lives):

```bash
docker compose up -d
```

Wait until the container is healthy (`docker compose ps`).

Default credentials match [`server/.env.example`](../.env.example):

- User: `kayphoto`
- Password: `kayphoto`
- Database: `kayphoto`
- Host port: `15432` (maps to Postgres `5432` inside the container; see repo `docker-compose.yml`)

## 2. Configure Django

```bash
cd server
cp .env.example .env
```

Ensure `.env` contains:

```bash
DATABASE_URL=postgresql://kayphoto:kayphoto@127.0.0.1:15432/kayphoto
```

## 3. Migrate and (optional) superuser

With your virtualenv activated:

```bash
python manage.py migrate
python manage.py createsuperuser
```

## 4. Check the connection

```bash
python manage.py check --database default
```

## 5. Stop Postgres

```bash
docker compose down
```

Data is kept in the `kayphoto_pg_data` volume. Use `docker compose down -v` to wipe the database.

## Troubleshooting

**Port conflicts:** This repo maps host `15432` → container `5432` to avoid clashing with a local Postgres on `5432`. If `15432` is taken, pick another host port in `docker-compose.yml` (e.g. `25432:5432`) and use that port in `DATABASE_URL`.

## Production / hosted Postgres

Use the provider’s connection string as `DATABASE_URL`. If the host requires SSL, append `?sslmode=require` (or use the URL they give you).
