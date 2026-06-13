#!/bin/sh
set -e

echo "Applying database migrations..."
./node_modules/.bin/prisma migrate deploy

echo "Running database seed..."
node dist/src/seed/seed.js

echo "Starting backend..."
exec node dist/src/main.js
