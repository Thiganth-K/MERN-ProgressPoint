# Data Export/Import System Documentation

## Overview

A comprehensive data export/import system that allows you to export all MongoDB data to a single JSON file and import it back when needed. This is useful for:
- **Data Migration**: Moving data between environments (dev, staging, production)
- **Backup & Restore**: Complete database snapshots
- **Data Sharing**: Sharing complete dataset with team members
- **Testing**: Creating test data sets
- **Disaster Recovery**: Quick restoration of entire database

---

## Features

### ✅ Complete Data Export
- Exports **all collections** to a single JSON file:
  - Admins
  - Batches (including all students)
  - Placement Done Students
  - Time Restrictions
- Includes **metadata** (export date, version, statistics)
- **Pretty-formatted JSON** for readability
- Automatic timestamped file naming

### ✅ Flexible Data Import
- Import from any exported JSON file
- **Selective import**: Choose specific collections
- **Clear existing data option**: Replace or merge
- **Automatic ID handling**: Prevents conflicts
- **Error resilience**: Continues on partial failures

### ✅ File Management
- List all exported files with metadata
- Download exports via API
- Delete old exports
- Size information (KB, MB)
- Creation/modification timestamps

---

## Directory Structure

```
backend/
├── src/
│   ├── dataExportImport.js                    # Core export/import logic
│   ├── controllers/
│   │   └── dataExportImportController.js      # API endpoints
│   └── routes/
│       └── dataExportImportRoutes.js          # Route definitions
└── data-exports/                              # Export files directory
    └── progresspoint_data_2025-12-02_14-30-45.json
```

---

## CLI Usage

### Export Data
```bash
cd backend
node src/dataExportImport.js export
```

**Output:**
```
🔄 Starting MongoDB data export...
✅ Connected to MongoDB
📦 Fetching data from collections...

✅ Data export completed successfully!
📁 File location: C:\...\backend\data-exports\progresspoint_data_2025-12-02_14-30-45.json
📊 Total documents exported:
   - Admins: 5
   - Batches: 12
   - Students: 350
   - Placement Done: 45
   - Time Restrictions: 2
📏 File size: 1250.35 KB (1.22 MB)
```

### Import Data
```bash
# Import without clearing existing data (merge)
node src/dataExportImport.js import data-exports/progresspoint_data_2025-12-02_14-30-45.json

# Import and clear existing data (replace)
node src/dataExportImport.js import data-exports/progresspoint_data_2025-12-02_14-30-45.json --clear
```

**Output:**
```
🔄 Starting MongoDB data import...
✅ Connected to MongoDB
📖 Reading data file...

📥 Importing admins...
   Found 5 documents to import
   ✅ Successfully imported 5 documents

📥 Importing batches...
   Found 12 documents to import
   ✅ Successfully imported 12 documents

📥 Importing placementDone...
   Found 45 documents to import
   ✅ Successfully imported 45 documents

📥 Importing timeRestrictions...
   Found 2 documents to import
   ✅ Successfully imported 2 documents

🎉 Data import completed!
📊 Total documents imported: 64
```

### List Exported Files
```bash
node src/dataExportImport.js list
```

**Output:**
```
📋 Exported Data Files:

1. progresspoint_data_2025-12-02_14-30-45.json
   Size: 1250.35 KB
   Created: 12/2/2025, 2:30:45 PM
   Export Date: 12/2/2025, 2:30:45 PM

2. progresspoint_data_2025-12-01_10-15-30.json
   Size: 1180.20 KB
   Created: 12/1/2025, 10:15:30 AM
   Export Date: 12/1/2025, 10:15:30 AM
```

---

## API Endpoints

All endpoints are under `/api/data`

### 1. Export All Data
**POST** `/api/data/export`

Exports all MongoDB data to a JSON file.

**Request:**
```javascript
// No body required
fetch('http://localhost:5001/api/data/export', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
```

**Response:**
```json
{
  "success": true,
  "message": "Data exported successfully",
  "fileName": "progresspoint_data_2025-12-02_14-30-45.json",
  "filePath": "C:\\...\\backend\\data-exports\\progresspoint_data_2025-12-02_14-30-45.json",
  "fileSize": 1280358,
  "statistics": {
    "totalAdmins": 5,
    "totalBatches": 12,
    "totalPlacementDoneStudents": 45,
    "totalTimeRestrictions": 2,
    "totalStudentsInBatches": 350
  },
  "metadata": {
    "exportDate": "2025-12-02T14:30:45.123Z",
    "exportTimestamp": "2025-12-02_14-30-45",
    "version": "2.0.0",
    "application": "MERN-ProgressPoint"
  }
}
```

### 2. Import Data
**POST** `/api/data/import`

Imports data from a JSON file.

**Request:**
```javascript
fetch('http://localhost:5001/api/data/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filePath: 'data-exports/progresspoint_data_2025-12-02_14-30-45.json',
    clearExisting: false,  // true to replace, false to merge
    collectionsToImport: ['admins', 'batches', 'placementDone', 'timeRestrictions']
  })
})
```

**Response:**
```json
{
  "success": true,
  "message": "Data imported successfully",
  "importResults": {
    "timestamp": "2025-12-02T15:00:00.123Z",
    "collections": {
      "admins": { "imported": 5, "status": "success" },
      "batches": { "imported": 12, "status": "success" },
      "placementDone": { "imported": 45, "status": "success" },
      "timeRestrictions": { "imported": 2, "status": "success" }
    },
    "totalImported": 64,
    "errors": []
  },
  "sourceMetadata": {
    "exportDate": "2025-12-02T14:30:45.123Z",
    "version": "2.0.0"
  }
}
```

### 3. List Exported Files
**GET** `/api/data/list`

Lists all exported data files.

**Request:**
```javascript
fetch('http://localhost:5001/api/data/list')
```

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "fileName": "progresspoint_data_2025-12-02_14-30-45.json",
      "size": 1280358,
      "sizeKB": "1250.35",
      "sizeMB": "1.22",
      "created": "2025-12-02T14:30:45.123Z",
      "modified": "2025-12-02T14:30:45.123Z",
      "metadata": {
        "exportDate": "2025-12-02T14:30:45.123Z",
        "version": "2.0.0"
      }
    }
  ]
}
```

### 4. Download Export File
**GET** `/api/data/download/:fileName`

Downloads a specific export file.

**Request:**
```javascript
window.location.href = 'http://localhost:5001/api/data/download/progresspoint_data_2025-12-02_14-30-45.json';
```

**Response:**
File download with `Content-Disposition: attachment`

### 5. Delete Export File
**DELETE** `/api/data/delete/:fileName`

Deletes a specific export file.

**Request:**
```javascript
fetch('http://localhost:5001/api/data/delete/progresspoint_data_2025-12-02_14-30-45.json', {
  method: 'DELETE'
})
```

**Response:**
```json
{
  "success": true,
  "message": "Export file deleted successfully",
  "deletedFile": "progresspoint_data_2025-12-02_14-30-45.json"
}
```

---

## Exported JSON File Structure

```json
{
  "metadata": {
    "exportDate": "2025-12-02T14:30:45.123Z",
    "exportTimestamp": "2025-12-02_14-30-45",
    "version": "2.0.0",
    "application": "MERN-ProgressPoint",
    "description": "Complete database export including all collections"
  },
  "statistics": {
    "totalAdmins": 5,
    "totalBatches": 12,
    "totalPlacementDoneStudents": 45,
    "totalTimeRestrictions": 2,
    "totalStudentsInBatches": 350
  },
  "collections": {
    "admins": [
      {
        "username": "admin1",
        "isSuperAdmin": false,
        "logs": [],
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "batches": [
      {
        "batchName": "CSE 2024 Batch A",
        "year": 2024,
        "students": [
          {
            "regNo": "21CSE001",
            "name": "John Doe",
            "department": "CSE",
            "marks": {
              "efforts": 85,
              "presentation": 90,
              "assessment": 88,
              "assignment": 92
            },
            "attendance": [
              {
                "date": "2025-12-01",
                "session": "FN",
                "status": "Present"
              }
            ],
            "attendancePercent": 95.5
          }
        ]
      }
    ],
    "placementDone": [
      {
        "regNo": "21CSE001",
        "name": "John Doe",
        "company": "Tech Corp",
        "package": "12 LPA",
        "type": "Full-time",
        "offers": [
          {
            "company": "Tech Corp",
            "package": "12 LPA",
            "type": "Full-time"
          }
        ]
      }
    ],
    "timeRestrictions": [
      {
        "type": "attendance",
        "fnStart": "09:00",
        "fnEnd": "13:00",
        "anStart": "14:00",
        "anEnd": "17:00"
      }
    ]
  }
}
```

---

## Use Cases

### 1. Data Migration Between Environments
```bash
# On Production Server
node src/dataExportImport.js export

# Copy file to Development Server
# On Development Server
node src/dataExportImport.js import data-exports/progresspoint_data_2025-12-02_14-30-45.json --clear
```

### 2. Scheduled Backups
Add to cron job or task scheduler:
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/backend && node src/dataExportImport.js export
```

### 3. Testing with Real Data
```bash
# Export production data
node src/dataExportImport.js export

# Import to test environment
node src/dataExportImport.js import data-exports/progresspoint_data_2025-12-02_14-30-45.json --clear
```

### 4. Selective Data Import
```javascript
// Only import admins and batches
await importAllData(filePath, {
  collectionsToImport: ['admins', 'batches']
});
```

---

## Security Considerations

1. **Path Traversal Protection**: File paths are validated to prevent directory traversal attacks
2. **Super Admin Only**: Restrict export/import endpoints to super admin users only
3. **Sensitive Data**: Exported files contain passwords (hashed) - store securely
4. **File Permissions**: Ensure `data-exports/` directory has appropriate permissions
5. **Backup Rotation**: Implement automated cleanup of old exports

---

## Troubleshooting

### Issue: "File not found" error during import
**Solution:** Ensure the file path is correct and relative to the backend directory
```bash
# Correct path
node src/dataExportImport.js import data-exports/progresspoint_data_2025-12-02_14-30-45.json

# Incorrect path
node src/dataExportImport.js import /absolute/path/to/file.json
```

### Issue: Import fails with duplicate key error
**Solution:** Use the `--clear` flag to remove existing data first
```bash
node src/dataExportImport.js import data-exports/file.json --clear
```

### Issue: Out of memory during export
**Solution:** For very large databases, consider exporting collections individually

---

## Comparison with Existing Backup System

| Feature | Data Export/Import | Backup System |
|---------|-------------------|---------------|
| **File Format** | Single JSON file | Multiple JSON files |
| **Use Case** | Data migration, sharing | Periodic backups |
| **Structure** | One file with metadata | Folder with separate files |
| **Portability** | High (single file) | Medium (multiple files) |
| **Import** | Full control, selective | Full restore only |
| **CLI Support** | Yes | Limited |

**Recommendation:** Use both systems:
- **Backup System**: For automated periodic backups
- **Data Export/Import**: For manual data migration and sharing

---

## Future Enhancements

- [ ] Web UI for export/import management
- [ ] Compression support (ZIP/GZIP)
- [ ] Incremental imports (merge strategies)
- [ ] Data validation before import
- [ ] Export scheduling
- [ ] Cloud storage integration (AWS S3, Azure Blob)
- [ ] Encryption for sensitive data
- [ ] Import progress tracking
- [ ] Rollback capability

---

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in console
3. Check file permissions for `data-exports/` directory
4. Verify MongoDB connection in `.env`
5. Create an issue in the project repository
