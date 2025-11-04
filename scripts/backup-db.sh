#!/bin/bash

# Database Backup Script
# Creates a backup of PostgreSQL database before clearing Docker

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Database Backup Script${NC}"
echo "========================"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
else
    echo -e "${YELLOW}Warning: .env file not found. Using defaults.${NC}"
    DB_NAME=${DB_NAME:-ticketing_db}
    DB_USER=${DB_USER:-postgres}
    DB_PORT=${DB_PORT:-5432}
fi

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/postgres_backup_${TIMESTAMP}.sql"
BACKUP_FILE_COMPRESSED="${BACKUP_FILE}.gz"

echo "Backing up database: $DB_NAME"
echo "Backup file: $BACKUP_FILE_COMPRESSED"

# Check if postgres container is running
if ! docker compose ps postgres | grep -q "Up"; then
    echo -e "${RED}Error: PostgreSQL container is not running!${NC}"
    echo "Start it with: docker compose up -d postgres"
    exit 1
fi

# Create backup using pg_dump
echo "Creating backup..."
docker compose exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

# Compress the backup
echo "Compressing backup..."
gzip "$BACKUP_FILE"

# Check if backup was successful
if [ -f "$BACKUP_FILE_COMPRESSED" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE_COMPRESSED" | cut -f1)
    echo -e "${GREEN}✓ Backup created successfully!${NC}"
    echo "  Size: $BACKUP_SIZE"
    echo "  Location: $BACKUP_FILE_COMPRESSED"
    
    # Keep only last 10 backups
    echo "Cleaning old backups (keeping last 10)..."
    cd "$BACKUP_DIR"
    ls -t postgres_backup_*.sql.gz | tail -n +11 | xargs -r rm -f
    
    echo -e "${GREEN}Backup complete!${NC}"
else
    echo -e "${RED}Error: Backup file was not created!${NC}"
    exit 1
fi

