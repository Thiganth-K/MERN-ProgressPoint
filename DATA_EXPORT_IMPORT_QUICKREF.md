# Data Export/Import - Quick Reference

## Quick Start

### Using npm scripts (Easiest!)
```bash
cd backend

# Export all data
npm run data:export

# List exported files
npm run data:list

# Import data (you'll need to provide file path)
npm run data:import data-exports/progresspoint_data_2025-12-02_14-30-45.json
```

### Using node directly
```bash
cd backend

# Export all data
node src/dataExportImport.js export

# List exported files
node src/dataExportImport.js list

# Import data (merge)
node src/dataExportImport.js import data-exports/progresspoint_data_2025-12-02_14-30-45.json

# Import data (replace - CAUTION!)
node src/dataExportImport.js import data-exports/progresspoint_data_2025-12-02_14-30-45.json --clear
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/data/export` | Export all data |
| POST | `/api/data/import` | Import data from file |
| GET | `/api/data/list` | List exported files |
| GET | `/api/data/download/:fileName` | Download export file |
| DELETE | `/api/data/delete/:fileName` | Delete export file |

---

## Frontend Integration Example

```javascript
import api from '@/lib/axios';

// Export data
const exportData = async () => {
  try {
    const response = await api.post('/data/export');
    console.log('Export created:', response.data.fileName);
    alert('Data exported successfully!');
  } catch (error) {
    console.error('Export failed:', error);
  }
};

// List exports
const listExports = async () => {
  try {
    const response = await api.get('/data/list');
    console.log('Files:', response.data.files);
  } catch (error) {
    console.error('Failed to list exports:', error);
  }
};

// Import data
const importData = async (fileName) => {
  try {
    const response = await api.post('/data/import', {
      filePath: `data-exports/${fileName}`,
      clearExisting: false
    });
    console.log('Import successful:', response.data.importResults);
    alert('Data imported successfully!');
  } catch (error) {
    console.error('Import failed:', error);
  }
};

// Download export
const downloadExport = (fileName) => {
  window.location.href = `http://localhost:5001/api/data/download/${fileName}`;
};
```

---

## Common Use Cases

### 1. Daily Backup
```bash
# Add to crontab (Linux/Mac)
0 2 * * * cd /path/to/backend && node src/dataExportImport.js export

# Add to Task Scheduler (Windows)
# Run: node src/dataExportImport.js export
# Schedule: Daily at 2:00 AM
```

### 2. Move Data Between Servers
```bash
# On Server A (Production)
node src/dataExportImport.js export

# Copy file to Server B (Development)
scp data-exports/progresspoint_data_*.json user@server-b:/path/to/backend/data-exports/

# On Server B
node src/dataExportImport.js import data-exports/progresspoint_data_*.json --clear
```

### 3. Share Data with Team
```bash
# Export data
node src/dataExportImport.js export

# Share the JSON file
# Team member can import it
node src/dataExportImport.js import <received-file>.json
```

---

## File Structure

```json
{
  "metadata": {
    "exportDate": "2025-12-02T14:30:45.123Z",
    "version": "2.0.0",
    "application": "MERN-ProgressPoint"
  },
  "statistics": {
    "totalAdmins": 5,
    "totalBatches": 12,
    "totalStudentsInBatches": 350,
    "totalPlacementDoneStudents": 45
  },
  "collections": {
    "admins": [...],
    "batches": [...],
    "placementDone": [...],
    "timeRestrictions": [...]
  }
}
```

---

## Important Notes

⚠️ **Security**: Export files contain sensitive data (passwords are hashed but still sensitive)

⚠️ **Storage**: Large databases create large files - monitor disk space

✅ **Backup**: Keep regular exports as backups

✅ **Version**: Files include version info for compatibility checking

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| File not found | Check path is relative to backend directory |
| Duplicate key error | Use `--clear` flag to replace existing data |
| Out of memory | Export collections individually (advanced) |
| Permission denied | Check file/folder permissions for data-exports/ |

---

## Examples

Run example scripts:
```bash
node src/examples-dataExportImport.js 1  # Export
node src/examples-dataExportImport.js 2  # List
node src/examples-dataExportImport.js 3  # Import (merge)
node src/examples-dataExportImport.js 4  # Import (replace)
node src/examples-dataExportImport.js 5  # Selective import
node src/examples-dataExportImport.js 6  # Full workflow
```

---

For full documentation, see [DATA_EXPORT_IMPORT.md](DATA_EXPORT_IMPORT.md)
