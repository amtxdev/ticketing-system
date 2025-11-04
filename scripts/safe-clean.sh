#!/bin/bash

# Safe Docker Clean Script
# Stops containers but preserves volumes (database data)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Safe Docker Clean Script${NC}"
echo "========================"
echo ""
echo "This script will:"
echo "  ✓ Stop all containers"
echo "  ✓ Remove containers and networks"
echo "  ✗ KEEP volumes (database data preserved)"
echo ""

read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

cd "$PROJECT_ROOT"

echo ""
echo -e "${YELLOW}Stopping containers...${NC}"
docker compose down

echo ""
echo -e "${GREEN}✓ Containers stopped and removed${NC}"
echo -e "${GREEN}✓ Volumes preserved (database data safe)${NC}"
echo ""
echo "To start again: docker compose up -d"
echo "To remove volumes too (WARNING: deletes database): docker compose down -v"

