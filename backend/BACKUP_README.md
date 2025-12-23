# Database Backup System

This backup system provides comprehensive data protection for your MERN ProgressPoint application.

## Features

- ✅ **Complete Database Backup**: Backs up all collections (admins, batches, placement done students, time restrictions)
- ✅ **JSON Format**: Human-readable backup files in JSON format
- ✅ **Timestamped Backups**: Each backup is saved with a unique timestamp
- ✅ **Backup Metadata**: Detailed information about each backup
- ✅ **Easy Restoration**: Simple commands to restore from any backup
- ✅ **CLI Interface**: Command-line tools for backup operations
- ✅ **API Endpoints**: Web API for backup operations via HTTP requests

## Quick Start

### 1. Create a Backup (CLI)

```bash
# Navigate to backend directory
cd backend

# Create a new backup
npm run backup

# Or use node directly
node src/backup.js backup
```

### 2. List Available Backups

```bash
npm run backup:list

# Or use node directly
node src/backup.js list
```

### 3. Restore from Backup

```bash
# Replace <timestamp> with actual backup timestamp
npm run backup:restore <timestamp>

# Example:
npm run backup:restore 2025-11-08_14-30-25

# Or use node directly
node src/backup.js restore 2025-11-08_14-30-25
```

## API Endpoints

You can also use HTTP requests to manage backups:

### Create Backup
```http
POST /api/backup/create
```

### List Backups
```http
GET /api/backup/list
```

### Restore Backup
```http
POST /api/backup/restore/:timestamp
```

## Backup Structure

Backups are stored in the `backend/backups/` directory with the following structure:

```
backups/
├── backup_2025-11-08_14-30-25/
│   ├── admins.json              # Admin users
│   ├── batches.json             # Student batches
│   ├── placementdone.json       # Placement done students
│   ├── timerestrictions.json    # Time restrictions
│   └── backup_info.json         # Backup metadata
├── backup_2025-11-08_15-45-10/
│   └── ...
└── latest_backup.json           # Points to most recent backup
```

## Collections Backed Up

1. **Admins** (`admins.json`)
   - Admin user accounts and credentials
   
2. **Batches** (`batches.json`)
   - Student batch information
   - Student records within batches
   - Attendance and marks data
   
3. **Placement Done** (`placementdone.json`)
   - Students who have completed placement
   - Company and placement details
   - Additional offers information
   
4. **Time Restrictions** (`timerestrictions.json`)
   - System time-based access controls

## Safety Features

- **Non-destructive Backups**: Creating backups never modifies existing data
- **Confirmation Required**: Restore operations require explicit timestamp specification
- **Backup Verification**: Each backup includes metadata for verification
- **Error Handling**: Comprehensive error handling and logging

## Best Practices

### Regular Backups
```bash
# Create daily backups (add to cron/task scheduler)
npm run backup
```

### Before Major Changes
```bash
# Always backup before:
# - Database migrations
# - Major updates
# - System maintenance
npm run backup
```

### Backup Verification
```bash
# List backups to verify creation
npm run backup:list
```

## Example Usage

### Complete Backup Workflow
```bash
# 1. Create backup before making changes
npm run backup

# 2. List backups to see the new backup
npm run backup:list

# 3. If something goes wrong, restore from backup
npm run backup:restore 2025-11-08_14-30-25
```

### API Usage Examples

#### Create Backup via API
```javascript
// Frontend JavaScript
const createBackup = async () => {
  try {
    const response = await fetch('/api/backup/create', {
      method: 'POST'
    });
    const result = await response.json();
    console.log('Backup created:', result);
  } catch (error) {
    console.error('Backup failed:', error);
  }
};
```

#### List Backups via API
```javascript
// Frontend JavaScript
const listBackups = async () => {
  try {
    const response = await fetch('/api/backup/list');
    const result = await response.json();
    console.log('Available backups:', result.backups);
  } catch (error) {
    console.error('Failed to list backups:', error);
  }
};
```

## Troubleshooting

### Common Issues

1. **Permission Errors**
   - Ensure write permissions to `backend/backups/` directory
   
2. **MongoDB Connection Issues**
   - Verify MongoDB connection string in `.env` file
   - Check network connectivity
   
3. **Backup Not Found**
   - Use `npm run backup:list` to see available backups
   - Verify timestamp format (YYYY-MM-DD_HH-MM-SS)

### Recovery Steps

If you need to recover from a major issue:

1. **Check Available Backups**
   ```bash
   npm run backup:list
   ```

2. **Choose Recent Backup**
   ```bash
   npm run backup:restore 2025-11-08_14-30-25
   ```

3. **Verify Restoration**
   - Start your application
   - Check that data is restored correctly

## Automation

### Windows Task Scheduler
Create a daily backup task:
```batch
cd C:\path\to\your\project\backend
npm run backup
```

### Linux Cron Job
Add to crontab for daily backups:
```bash
0 2 * * * cd /path/to/your/project/backend && npm run backup
```

## Security Notes

- Backup files contain sensitive data - store securely
- Consider encrypting backup files for production use
- Regularly test restore procedures
- Keep backups in multiple locations for disaster recovery

---

**⚠️ Important**: Always test backup and restore procedures in a development environment before using in production!