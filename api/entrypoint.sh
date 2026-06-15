#!/bin/sh
set -e

echo "Running database migrations..."
alembic -c api/alembic.ini upgrade head

echo "Starting application..."
exec "$@"
