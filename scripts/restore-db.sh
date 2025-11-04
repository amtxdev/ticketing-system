#!/bin/bash

# Database Restore Script
# Restores PostgreSQL database from a backup file

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Database Restore Script${NC}"
echo "========================"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: $0 <backup_file>${NC}"
    echo ""
    echo "Available backups:"
    if [ -d "$BACKUP_DIR" ] && [ -n "$(ls -A $BACKUP_DIR/*.sql.gz 2>/dev/null)" ]; then
        ls -lh "$BACKUP_DIR"/*.sql.gz | awk '{print "  " $9 " (" $5 ")"}'
    else
        echo "  No backups found in $BACKUP_DIR"
    fi
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
else
    echo -e "${YELLOW}Warning: .env file not found. Using defaults.${NC}"
    DB_NAME=${DB_NAME:-ticketing_db}
    DB_USER=${DB_USER:-postgres}
fi

echo -e "${YELLOW}WARNING: This will replace all data in the database!${NC}"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Check if postgres container is running
if ! docker compose ps postgres | grep -q "Up"; then
    echo -e "${YELLOW}PostgreSQL container is not running. Starting it...${NC}"
    docker compose up -d postgres
    echo "Waiting for database to be ready..."
    sleep 5
fi

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Decompressing backup..."
    TEMP_FILE=$(mktemp)
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    BACKUP_FILE="$TEMP_FILE"
    trap "rm -f $TEMP_FILE" EXIT
fi

echo "Restoring database: $DB_NAME"
echo "From backup: $1"

# Restore the database
docker compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_FILE"

echo -e "${GREEN}✓ Database restored successfully!${NC}"

