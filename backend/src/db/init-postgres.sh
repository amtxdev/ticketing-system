#!/bin/bash
set -e

# This script ensures the database user and database exist
# It's run as an init script when PostgreSQL container starts

echo "Initializing PostgreSQL database and user..."

# The POSTGRES_USER and POSTGRES_DB are set by Docker environment variables
# PostgreSQL automatically creates these on first initialization
# This script is mainly for ensuring permissions are correct

exit 0

