# Database Backups

This directory stores database backup files created by `scripts/backup-db.sh`.

## Backup Files

- Format: `postgres_backup_YYYYMMDD_HHMMSS.sql.gz`
- Automatically compressed with gzip
- Last 10 backups are kept automatically

## Usage

```bash
# Create a backup
../scripts/backup-db.sh

# Restore from backup
../scripts/restore-db.sh postgres_backup_20241104_120000.sql.gz
```

## Important Notes

- Backup files are excluded from git (see `.gitignore`)
- Backups are stored locally only
- For production, set up automated backups to cloud storage
- Test restore procedures regularly
