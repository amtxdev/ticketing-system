# Infrastructure Provisioning

This directory contains scripts and configurations for provisioning backend infrastructure that demonstrates:

- **Scalability**: Stateless services, horizontal scaling support, load balancing
- **Security**: Network isolation, credential management, least-privilege access
- **Extensibility**: Modular design, easy to add new services/resources

## Quick Start

### Local Development

```bash
# Provision all infrastructure
./provision.sh local

# Start all services
cd ..
docker-compose up -d


# Check health
curl http://localhost:3000/health
```

### Teardown

```bash
# Remove all containers (keep volumes)
./teardown.sh local --keep-volumes

# Remove everything including volumes
./teardown.sh local
```

## Architecture

### Components

1. **Compute Runtime** (Backend API)
   - Stateless Node.js/Express application
   - Horizontally scalable
   - Container-based deployment

2. **Managed Database** (PostgreSQL)
   - Local: Docker container
   - Production: Managed service (RDS, Cloud SQL, etc.)

3. **Object Storage** (S3-compatible)
   - Production: S3, Azure Blob, GCS

4. **Authentication Provider**
   - Local: JWT-based (built-in)
   - Production: AWS Cognito, Auth0, Azure AD B2C

## Scalability Features

### Horizontal Scaling

The backend is designed to be stateless and can scale horizontally:

```bash
# Scale backend instances (local example)
docker-compose up -d --scale backend=3

# In production, use:
# - Kubernetes: kubectl scale deployment backend
# - Docker Swarm: docker service scale ticketing_backend=3
# - Cloud: Auto-scaling groups, container instances
```

### Load Balancing

For production, configure a load balancer:
- **AWS**: Application Load Balancer (ALB)
- **Azure**: Application Gateway
- **GCP**: Cloud Load Balancing
- **On-premise**: nginx, traefik, HAProxy

### Database Scaling

- **Read Replicas**: For read-heavy workloads
- **Connection Pooling**: Configured in application (pg pool)
- **Managed Services**: Use cloud-managed databases with auto-scaling

## Security Features

### Network Isolation

- All services communicate via isolated Docker network
- Only necessary ports exposed to host
- Production: Use VPC/subnets, security groups

### Credential Management

- Secrets stored in `.env` file (not committed to git)
- Production: Use secrets management:
  - AWS Secrets Manager
  - Azure Key Vault
  - HashiCorp Vault
  - Kubernetes Secrets

### Least Privilege

- Each service runs with minimal required permissions
- Database users with specific roles
- Object storage bucket policies

### Secure Endpoints

- JWT-based authentication
- Role-based authorization (RBAC)
- HTTPS/TLS in production (configure at load balancer)

## Extensibility

### Adding New Services

To add a new service:

1. **Add to docker-compose.yaml**:
```yaml
new-service:
  image: service:latest
  networks:
    - ticketing-network
  # ... configuration
```

2. **Update provision.sh**:
```bash
provision_new_service() {
    log_info "Provisioning new service..."
    # Provisioning logic
}
```

3. **Update network policies** if needed

### Adding New Resources

1. **Storage**: Add volume in docker-compose
2. **Cache**: Add Redis/Memcached service
3. **Message Queue**: Add RabbitMQ/Kafka service
4. **Monitoring**: Add Prometheus/Grafana stack

## Production Considerations

### TODO: Production Checklist

- [ ] Use managed database service (RDS, Cloud SQL)
- [ ] Use managed object storage (S3, Azure Blob, GCS)
- [ ] Configure external authentication provider
- [ ] Set up load balancer with SSL/TLS
- [ ] Configure auto-scaling policies
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategies
- [ ] Use secrets management service
- [ ] Configure network security (VPC, firewalls)
- [ ] Set up CI/CD pipelines
- [ ] Configure log aggregation
- [ ] Set up disaster recovery

### Cloud-Specific Provisioning

#### AWS
```bash
# TODO: Use AWS CDK, Terraform, or CloudFormation
# - RDS for PostgreSQL
# - S3 for object storage
# - ECS/EKS for compute
# - ALB for load balancing
# - Secrets Manager for credentials
```

#### Azure
```bash
# TODO: Use ARM templates, Bicep, or Terraform
# - Azure Database for PostgreSQL
# - Azure Blob Storage
# - AKS for compute
# - Application Gateway
# - Key Vault for secrets
```

#### GCP
```bash
# TODO: Use Deployment Manager, Terraform, or gcloud
# - Cloud SQL for PostgreSQL
# - Cloud Storage
# - GKE for compute
# - Cloud Load Balancing
# - Secret Manager
```

## Scripts

- `provision.sh`: Provisions all infrastructure
- `teardown.sh`: Safely removes infrastructure
- Future: `backup.sh`, `restore.sh`, `scale.sh`

## Monitoring

TODO: Add monitoring stack:
- Prometheus for metrics
- Grafana for dashboards
- ELK for logging
- APM for performance monitoring

## Backup Strategy

TODO: Configure backups:
- Database: Automated backups (managed services)
- Object Storage: Versioning and lifecycle policies
- Configuration: Infrastructure as Code (IaC)
