#!/bin/bash

echo "🔄 Creating backup of Product Scout system..."

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "📊 Backing up database..."
docker-compose -f docker-compose.dev.yml exec -T postgres pg_dump -U n8n n8n > $BACKUP_DIR/db_backup_$DATE.sql

# n8n workflows backup
echo "🔧 Backing up n8n workflows..."
docker cp $(docker-compose -f docker-compose.dev.yml ps -q n8n):/home/node/.n8n/workflows $BACKUP_DIR/workflows_$DATE

# Custom scripts backup
echo "📜 Backing up custom scripts..."
cp -r custom-scripts $BACKUP_DIR/custom-scripts_$DATE

# Compress
echo "🗜️ Compressing backup..."
tar -czf $BACKUP_DIR/full_backup_$DATE.tar.gz -C $BACKUP_DIR db_backup_$DATE.sql workflows_$DATE custom-scripts_$DATE

# Cleanup
rm -rf $BACKUP_DIR/workflows_$DATE $BACKUP_DIR/custom-scripts_$DATE

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR/full_backup_$DATE.tar.gz"
