#!/bin/sh

# Ensure DATABASE_URL is available to Prisma
export DATABASE_URL="$(printenv DATABASE_URL)"

npx prisma migrate deploy --schema prisma/schema.prisma
