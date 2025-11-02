#!/bin/bash

###############################################################################
# Infrastructure Teardown Script
#
# Safely tears down provisioned infrastructure.
# WARNING: This will remove all containers, volumes, and networks!
#
# Usage:
#   ./teardown.sh [environment] [--keep-volumes]
#
###############################################################################

set -e

ENVIRONMENT=${1:-local}
KEEP_VOLUMES=${2:-}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

main() {
    log_warning "This will tear down all infrastructure for environment: $ENVIRONMENT"
    
    if [ "$KEEP_VOLUMES" != "--keep-volumes" ]; then
        read -p "Are you sure? This will delete all data! (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            log_info "Teardown cancelled"
            exit 0
        fi
    fi
    
    cd "$PROJECT_ROOT"
    
    log_info "Stopping and removing containers..."
    docker-compose down || docker compose down
    
    if [ "$KEEP_VOLUMES" != "--keep-volumes" ]; then
        log_warning "Removing volumes (all data will be lost)..."
        docker-compose down -v || docker compose down -v
    else
        log_info "Volumes preserved (--keep-volumes flag)"
    fi
    
    log_info "Removing networks..."
    docker network rm ticketing-network 2>/dev/null || true
    
    log_success "Teardown completed"
}

main "$@"

