# Scripts

Utility scripts for managing the Ticketing System.

## Database Management

### `backup-db.sh`
Creates a backup of the PostgreSQL database.

```bash
# Create backup
./scripts/backup-db.sh
```

- Creates timestamped backup in `backups/` directory
- Automatically compresses backup files
- Keeps last 10 backups (removes older ones)
- Requires PostgreSQL container to be running

### `restore-db.sh`
Restores the database from a backup file.

```bash
# List available backups and restore
./scripts/restore-db.sh backups/postgres_backup_20241104_120000.sql.gz
```

- Restores database from compressed backup
- **WARNING**: Replaces all current database data
- Requires confirmation before proceeding

## Docker Management

### `safe-clean.sh`
Safely stops containers while preserving database volumes.

```bash
# Stop containers but keep database data
./scripts/safe-clean.sh
```

**What it does:**
- Stops all containers
- Removes containers and networks
- **KEEPS volumes** (database data is preserved)

**Equivalent to:** `docker compose down` (without `-v` flag)

## Docker Commands Reference

### Safe Commands (Data Preserved)
```bash
# Stop containers, keep volumes
docker compose down

# Stop and remove containers, keep volumes
docker compose stop
docker compose rm

# Restart containers (data preserved)
docker compose restart
```

### Dangerous Commands (Data Lost)
```bash
# WARNING: Removes volumes (deletes database!)
docker compose down -v

# WARNING: Removes specific volume
docker volume rm project-scaffolding_postgres_data

# WARNING: Removes all unused volumes
docker volume prune
```

## Best Practices

1. **Always backup before clearing:**
   ```bash
   ./scripts/backup-db.sh
   docker compose down -v  # Safe now, data is backed up
   ```

2. **Use safe-clean.sh for regular cleanup:**
   ```bash
   ./scripts/safe-clean.sh  # Preserves database
   ```

3. **Check volumes before removing:**
   ```bash
   docker volume ls
   docker volume inspect project-scaffolding_postgres_data
   ```

4. **Verify volumes are persistent:**
   ```bash
   # Check if volumes exist
   docker volume ls | grep postgres_data
   ```

## Volume Locations

Docker volumes are stored in Docker's volume directory:
- **Linux**: `/var/lib/docker/volumes/`
- **macOS/Windows**: Docker Desktop manages volumes internally

To see volume details:
```bash
docker volume inspect project-scaffolding_postgres_data
```

## Backup Strategy

### Automatic Backups
Consider setting up a cron job for automatic daily backups:

```bash
# Add to crontab (crontab -e)
0 2 * * * /path/to/project/scripts/backup-db.sh
```

### Manual Backups
Before major operations:
```bash
./scripts/backup-db.sh
```

### Backup Retention
The script automatically keeps the last 10 backups. To change this, edit `backup-db.sh`:
```bash
# Change number of backups to keep
ls -t postgres_backup_*.sql.gz | tail -n +11 | xargs -r rm -f
```
