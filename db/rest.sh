#!/bin/bash
echo "Stopping and removing containers + volumes..."
docker compose down -v

echo "Rebuilding fresh database..."
docker compose up -d

echo "Waiting for Postgres to be ready..."
until docker exec waynder-db pg_isready -U waynder > /dev/null 2>&1; do
  sleep 1
done

echo "Database is up and ready."