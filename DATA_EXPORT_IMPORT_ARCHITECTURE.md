# Data Export/Import System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   MERN-ProgressPoint Application                 │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    MongoDB Database                         │ │
│  │  ┌─────────────┬─────────────┬────────────┬──────────────┐ │ │
│  │  │   Admins    │   Batches   │ Placement  │     Time     │ │ │
│  │  │ Collection  │ Collection  │  Done Coll.│ Restrictions │ │ │
│  │  └─────────────┴─────────────┴────────────┴──────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            │                   ▲                 │
│                            │                   │                 │
│                   ┌────────▼──────────┐       │                 │
│                   │  EXPORT FUNCTION  │       │                 │
│                   │ exportAllData()   │       │                 │
│                   └────────┬──────────┘       │                 │
│                            │                  │                 │
│                            ▼                  │                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Single JSON File (Timestamped)                  │  │
│  │  progresspoint_data_2025-12-02_14-30-45.json             │  │
│  │                                                            │  │
│  │  {                                                         │  │
│  │    "metadata": { ... },                                   │  │
│  │    "statistics": { ... },                                 │  │
│  │    "collections": {                                       │  │
│  │      "admins": [...],                                     │  │
│  │      "batches": [...],                                    │  │
│  │      "placementDone": [...],                              │  │
│  │      "timeRestrictions": [...]                            │  │
│  │    }                                                       │  │
│  │  }                                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                   ▲                │
│                            │                   │                │
│                   ┌────────▼──────────┐       │                │
│                   │  IMPORT FUNCTION  │       │                │
│                   │ importAllData()   │       │                │
│                   │                   │       │                │
│                   │ Options:          │       │                │
│                   │ • Merge           │       │                │
│                   │ • Replace         │───────┘                │
│                   │ • Selective       │                        │
│                   └───────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Export Flow
```
MongoDB → Read All Collections → Format as JSON → Write to File → Return Metadata
```

### Import Flow
```
JSON File → Parse → Validate → Clear (Optional) → Insert → Return Results
```

## Access Methods

### 1. Command Line Interface (CLI)
```
User Terminal
     │
     ▼
node src/dataExportImport.js export
     │
     ▼
dataExportImport.js
     │
     ▼
MongoDB / File System
```

### 2. API Endpoints
```
Frontend/Postman
     │
     ▼
POST /api/data/export
     │
     ▼
dataExportImportController.js
     │
     ▼
dataExportImport.js
     │
     ▼
MongoDB / File System
```

### 3. npm Scripts
```
User Terminal
     │
     ▼
npm run data:export
     │
     ▼
package.json script
     │
     ▼
node src/dataExportImport.js export
     │
     ▼
MongoDB / File System
```

## File Structure

```
backend/
├── src/
│   ├── dataExportImport.js              ← Core Logic
│   │   ├── exportAllData()              ← Export function
│   │   ├── importAllData()              ← Import function
│   │   ├── listExportedFiles()          ← List function
│   │   └── deleteExportedFile()         ← Delete function
│   │
│   ├── controllers/
│   │   └── dataExportImportController.js ← API Controllers
│   │       ├── exportData()             ← POST /api/data/export
│   │       ├── importData()             ← POST /api/data/import
│   │       ├── listExports()            ← GET /api/data/list
│   │       ├── downloadExport()         ← GET /api/data/download/:fileName
│   │       └── deleteExport()           ← DELETE /api/data/delete/:fileName
│   │
│   └── routes/
│       ├── dataExportImportRoutes.js    ← Route Definitions
│       └── index.js                     ← Main Router (includes /data routes)
│
└── data-exports/                        ← Export Files Directory
    ├── progresspoint_data_2025-12-02_14-30-45.json
    ├── progresspoint_data_2025-12-01_10-15-30.json
    └── progresspoint_data_2025-11-30_09-20-15.json
```

## Integration Points

```
┌──────────────┐
│   Frontend   │
│  (Optional)  │
└──────┬───────┘
       │
       │ API Calls
       ▼
┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│ API Endpoints│────▶│  Core Logic    │────▶│   MongoDB    │
│ (Express)    │     │ (JS Functions) │     │  (Database)  │
└──────────────┘     └────────┬───────┘     └──────────────┘
       ▲                      │
       │                      ▼
       │              ┌──────────────┐
       │              │ File System  │
       │              │(data-exports)│
       │              └──────────────┘
       │
┌──────┴───────┐
│     CLI      │
│  (Terminal)  │
└──────────────┘
```

## Use Case Scenarios

### Scenario 1: Local Backup
```
Developer's Machine
    │
    ├── Export: npm run data:export
    │      ↓
    │   data-exports/backup.json
    │      ↓
    │   (Store safely)
```

### Scenario 2: Server Migration
```
Server A (Production)          Server B (Development)
    │                               │
    ├── Export data                 │
    │      ↓                        │
    │   backup.json ────────────▶   │
    │                               ├── Import data
    │                               │      ↓
    │                               │   Database updated
```

### Scenario 3: Team Collaboration
```
Team Member A              Team Member B
    │                          │
    ├── Export data            │
    │      ↓                   │
    │   shared.json ──────▶    │
    │                          ├── Import data
    │                          │      ↓
    │                          │   Same database state
```

## Security Layer

```
┌─────────────────────────────────────────┐
│         API Request                     │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│   Authentication Middleware             │
│   (Check if Super Admin - Recommended)  │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│   Path Validation                       │
│   (Prevent directory traversal)         │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│   Execute Export/Import                 │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│   Return Result                         │
└─────────────────────────────────────────┘
```

## Performance Considerations

### Export Performance
```
Small Database (<1MB)     → ~1 second
Medium Database (1-10MB)  → ~2-5 seconds
Large Database (>10MB)    → ~10+ seconds
```

### Import Performance
```
Merge Mode     → Slower (checks for duplicates)
Replace Mode   → Faster (deletes then inserts)
Selective Mode → Medium (only selected collections)
```

## Error Handling Flow

```
┌────────────────┐
│  User Request  │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Try Execute   │
└───────┬────────┘
        │
        ├─── Success ────▶ Return Result
        │
        └─── Error ──────▶ Catch & Log ──▶ Return Error Message
```

## Comparison with Backup System

```
┌─────────────────────────────────────────────────────────────────┐
│                     Backup System                                │
│  Multiple Files in Folders                                       │
│  backup_2025-12-02_14-30-45/                                    │
│  ├── admins.json                                                 │
│  ├── batches.json                                                │
│  ├── placementdone.json                                          │
│  └── backup_info.json                                            │
│                                                                   │
│  Use Case: Periodic automated backups                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              Data Export/Import System                           │
│  Single JSON File                                                │
│  progresspoint_data_2025-12-02_14-30-45.json                    │
│  (Contains everything in one file)                               │
│                                                                   │
│  Use Case: Migration, sharing, manual backups                    │
└─────────────────────────────────────────────────────────────────┘
```

Both systems work together to provide comprehensive data management!
