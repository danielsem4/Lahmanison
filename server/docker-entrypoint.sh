#!/bin/sh
set -e

# Apply any pending database migrations before the server starts. On a fresh
# database this creates the full schema from prisma/migrations.
echo "Applying database migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec node dist/index.js
