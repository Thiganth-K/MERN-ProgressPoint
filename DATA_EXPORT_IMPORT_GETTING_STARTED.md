# 🚀 Data Export/Import - Getting Started

## ⚡ Fastest Way to Use

```bash
cd backend
npm run data:export
```

**That's it!** Your data is now exported to `backend/data-exports/`

---

## 📋 Step-by-Step Guide

### Step 1: Export Your Data

```bash
cd backend
npm run data:export
```

**You'll see:**
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

**Result:** You now have a complete snapshot of your database!

---

### Step 2: Find Your Export

```bash
npm run data:list
```

**You'll see:**
```
📋 Exported Data Files:

1. progresspoint_data_2025-12-02_14-30-45.json
   Size: 1250.35 KB
   Created: 12/2/2025, 2:30:45 PM
   Export Date: 12/2/2025, 2:30:45 PM
```

**Result:** List of all your exports with timestamps and sizes

---

### Step 3: Import Data (When Needed)

**⚠️ Important:** Choose merge or replace mode

#### Option A: Merge (Safer - Adds New Data)
```bash
node src/dataExportImport.js import data-exports/progresspoint_data_2025-12-02_14-30-45.json
```

#### Option B: Replace (Caution - Clears Existing Data)
```bash
node src/dataExportImport.js import data-exports/progresspoint_data_2025-12-02_14-30-45.json --clear
```

**You'll see:**
```
🔄 Starting MongoDB data import...
✅ Connected to MongoDB
📖 Reading data file...

📥 Importing admins...
   ✅ Successfully imported 5 documents

📥 Importing batches...
   ✅ Successfully imported 12 documents

🎉 Data import completed!
📊 Total documents imported: 64
```

---

## 🎯 Common Scenarios

### Scenario 1: Daily Backup
```bash
# Run this once a day
cd backend
npm run data:export
```

### Scenario 2: Share Data with Team
```bash
# 1. Export data
npm run data:export

# 2. Share the JSON file from data-exports/ folder
# (via email, USB, cloud storage, etc.)

# 3. Team member imports it
node src/dataExportImport.js import <received-file>.json
```

### Scenario 3: Move to New Server
```bash
# On OLD server
cd backend
npm run data:export

# Copy file to NEW server
# (download the file from data-exports/ folder)

# On NEW server
cd backend
node src/dataExportImport.js import data-exports/<file-name>.json --clear
```

### Scenario 4: Restore After Mistake
```bash
# 1. You made a mistake and need to restore

# 2. List your backups
npm run data:list

# 3. Import the one before the mistake
node src/dataExportImport.js import data-exports/progresspoint_data_2025-12-01_10-15-30.json --clear
```

---

## 📂 Where Are My Files?

```
MERN-ProgressPoint/
└── backend/
    └── data-exports/                               👈 Your export files are here!
        ├── progresspoint_data_2025-12-02_14-30-45.json
        ├── progresspoint_data_2025-12-01_10-15-30.json
        └── progresspoint_data_2025-11-30_09-20-15.json
```

---

## ✅ What's Included in the Export?

Each export file contains:

- ✅ **All Admins** (including super admin)
- ✅ **All Batches** (with all students and their data)
- ✅ **All Student Data** (marks, attendance, emails)
- ✅ **All Placement Records**
- ✅ **All Time Restrictions**
- ✅ **Metadata** (date, version, statistics)

**One file = Complete database snapshot!**

---

## 🔒 Important Notes

### Security
- 🔐 Files contain admin passwords (hashed)
- 🔐 Keep export files secure
- 🔐 Don't share publicly

### Storage
- 💾 Files can be large for big databases
- 💾 Monitor disk space in `data-exports/`
- 💾 Delete old exports periodically

### Safety
- ⚠️ Use `--clear` flag carefully (it deletes existing data!)
- ⚠️ Test imports on development server first
- ⚠️ Keep multiple backups

---

## 🆘 Help Commands

```bash
# Show all commands
node src/dataExportImport.js

# Show examples
node src/examples-dataExportImport.js
```

---

## 📚 More Information

- **Full Documentation**: [DATA_EXPORT_IMPORT.md](DATA_EXPORT_IMPORT.md)
- **Quick Reference**: [DATA_EXPORT_IMPORT_QUICKREF.md](DATA_EXPORT_IMPORT_QUICKREF.md)
- **Implementation Summary**: [IMPLEMENTATION_SUMMARY_DATA_EXPORT_IMPORT.md](IMPLEMENTATION_SUMMARY_DATA_EXPORT_IMPORT.md)

---

## 🎉 You're All Set!

Start with:
```bash
cd backend
npm run data:export
```

Your database is now backed up! 🚀
