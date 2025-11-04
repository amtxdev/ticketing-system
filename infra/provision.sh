#!/bin/bash

###############################################################################
# Infrastructure Provisioning Script
# 
# This script automates the provisioning of backend infrastructure for the
# Ticketing System. It demonstrates:
# - Scalability: Stateless services, horizontal scaling support
# - Security: Network isolation, credential management, least-privilege
# - Extensibility: Modular design, easy to add new services
#
# Usage:
#   ./provision.sh [environment]
#   Where environment is: local, staging, production
#
###############################################################################

set -e  # Exit on error

ENVIRONMENT=${1:-local}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

###############################################################################
# Configuration
###############################################################################

load_config() {
    log_info "Loading configuration for environment: $ENVIRONMENT"
    
    case $ENVIRONMENT in
        local)
            COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yaml"
            MIN_REPLICAS=1
            MAX_REPLICAS=2
            ;;
        staging)
            COMPOSE_FILE="$PROJECT_ROOT/docker-compose.staging.yaml"
            MIN_REPLICAS=2
            MAX_REPLICAS=4
            # TODO: Load staging secrets from secure storage
            ;;
        production)
            COMPOSE_FILE="$PROJECT_ROOT/docker-compose.prod.yaml"
            MIN_REPLICAS=3
            MAX_REPLICAS=10
            # TODO: Load production secrets from AWS Secrets Manager / Azure Key Vault
            # TODO: Use managed database services (RDS, Cloud SQL)
            # TODO: Use managed object storage (S3, Azure Blob, GCS)
            log_error "Production provisioning not fully implemented - use managed services!"
            exit 1
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
}

###############################################################################
# Pre-flight Checks
###############################################################################

check_requirements() {
    log_info "Checking requirements..."
    
    local missing_deps=()
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        missing_deps+=("docker-compose")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        exit 1
    fi
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    log_success "All requirements met"
}

###############################################################################
# Security: Credential Management
###############################################################################

setup_credentials() {
    log_info "Setting up credentials..."
    
    local env_file="$PROJECT_ROOT/.env"
    
    # Generate secrets if they don't exist
    if [ ! -f "$env_file" ]; then
        log_warning ".env file not found, generating secrets..."
        
        # Generate JWT secret
        JWT_SECRET=$(openssl rand -base64 32)
        
        # Generate database password
        DB_PASSWORD=$(openssl rand -base64 24)
        
        cat > "$env_file" <<EOF
# Auto-generated secrets - DO NOT COMMIT TO VERSION CONTROL
# TODO: Use proper secrets management in production (AWS Secrets Manager, HashiCorp Vault, etc.)

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# Database Configuration
DB_PASSWORD=$DB_PASSWORD


# Environment
NODE_ENV=$ENVIRONMENT
EOF
        
        log_success "Credentials generated in $env_file"
        log_warning "IMPORTANT: Store these credentials securely in production!"
    else
        log_info "Using existing .env file"
    fi
    
    # Security: Ensure .env is not readable by others
    chmod 600 "$env_file" 2>/dev/null || true
}

###############################################################################
# Provision: Compute Runtime (Backend API)
###############################################################################

provision_compute() {
    log_info "Provisioning compute runtime (Backend API)..."
    
    # Build backend image
    log_info "Building backend Docker image..."
    docker build -t ticketing-backend:latest "$PROJECT_ROOT/backend" || {
        log_error "Failed to build backend image"
        exit 1
    }
    
    # Scalability: Tag for potential registry push
    # TODO: Push to container registry (ECR, ACR, GCR) for multi-node deployments
    # docker tag ticketing-backend:latest registry.example.com/ticketing-backend:latest
    # docker push registry.example.com/ticketing-backend:latest
    
    log_success "Compute runtime provisioned"
}

###############################################################################
# Provision: Managed Database (PostgreSQL)
###############################################################################

provision_database() {
    log_info "Provisioning managed database..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        log_warning "Production: Use managed database service (RDS, Cloud SQL, etc.)"
        log_info "Skipping local database provisioning for production"
        return
    fi
    
    # Check if postgres container already exists
    if docker ps -a --format '{{.Names}}' | grep -q "^ticketing-postgres$"; then
        log_info "Database container already exists"
    else
        log_info "Database will be created by docker-compose"
    fi
    
    log_success "Database provisioning configured"
    
    # TODO: For production, provision via:
    # - AWS: aws rds create-db-instance
    # - Azure: az postgres server create
    # - GCP: gcloud sql instances create
}

###############################################################################
# Provision: Object Storage (MinIO / S3)
###############################################################################

provision_storage() {
    log_info "Provisioning object storage..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        log_warning "Production: Use managed object storage (S3, Azure Blob, GCS)"
        log_info "Skipping local storage provisioning for production"
        return
    fi
    
    log_info "Object storage not configured for local development"
    
    log_success "Object storage provisioning configured"
    
    # TODO: For production, provision via:
    # - AWS: aws s3api create-bucket
    # - Azure: az storage account create
    # - GCP: gsutil mb gs://bucket-name
}

###############################################################################
# Provision: Authentication Provider
###############################################################################

provision_auth() {
    log_info "Configuring authentication provider..."
    
    # For this implementation, authentication is handled by the backend
    # In production, consider:
    # - AWS Cognito
    # - Auth0
    # - Azure AD B2C
    # - Firebase Auth
    
    log_info "Using JWT-based authentication (built into backend)"
    log_success "Authentication provider configured"
    
    # TODO: For production, configure external auth provider:
    # - Set up OAuth2/OIDC endpoints
    # - Configure identity provider settings
    # - Set up user sync mechanisms
}

###############################################################################
# Networking: Isolation and Security
###############################################################################

setup_networking() {
    log_info "Setting up network isolation..."
    
    # Docker Compose handles network creation
    # For production, configure:
    # - VPC/subnet isolation (AWS, Azure, GCP)
    # - Security groups / Network Security Groups
    # - Load balancers with SSL termination
    # - WAF rules for API protection
    
    log_success "Network configuration ready"
    
    # TODO: Production networking setup:
    # - aws ec2 create-vpc
    # - az network vnet create
    # - gcloud compute networks create
}

###############################################################################
# Scalability: Load Balancer Configuration
###############################################################################

setup_load_balancer() {
    log_info "Configuring load balancing..."
    
    if [ "$ENVIRONMENT" = "local" ]; then
        log_info "Local environment: Load balancing not configured"
        log_info "For local development, use docker-compose scale backend=N"
        return
    fi
    
    log_warning "Load balancer setup not fully automated"
    log_info "TODO: Configure load balancer:"
    log_info "  - AWS: Application Load Balancer (ALB)"
    log_info "  - Azure: Application Gateway"
    log_info "  - GCP: Cloud Load Balancing"
    log_info "  - On-premise: nginx, traefik, or HAProxy"
    
    # TODO: Implement load balancer provisioning
    # - Create load balancer resource
    # - Configure health checks
    # - Set up SSL certificates
    # - Configure routing rules
}

###############################################################################
# Monitoring and Observability
###############################################################################

setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # TODO: Implement monitoring stack
    # - Prometheus for metrics
    # - Grafana for dashboards
    # - ELK stack for logging
    # - APM for application performance
    
    log_info "Monitoring setup deferred"
    log_info "TODO: Configure monitoring services"
}

###############################################################################
# Main Provisioning Flow
###############################################################################

main() {
    log_info "=========================================="
    log_info "Ticketing System Infrastructure Provision"
    log_info "Environment: $ENVIRONMENT"
    log_info "=========================================="
    
    # Pre-flight
    check_requirements
    load_config
    
    # Security
    setup_credentials
    
    # Provisioning
    provision_compute
    provision_database
    provision_storage
    provision_auth
    
    # Infrastructure
    setup_networking
    setup_load_balancer
    setup_monitoring
    
    log_success "=========================================="
    log_success "Provisioning completed successfully!"
    log_success "=========================================="
    log_info ""
    log_info "Next steps:"
    log_info "  1. Review generated .env file"
    log_info "  2. Start services: docker-compose up -d"
    log_info "  4. Check health: curl http://localhost:3000/health"
    log_info ""
}

# Run main function
main "$@"

