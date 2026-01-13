# 🚂 Railway Migration Guide

## ✅ Database Export Complete!

Your SQLite database has been successfully exported to PostgreSQL-compatible SQL format.

---

## 📊 What Was Exported

### Tables and Data:
- ✅ **tasks** - 7 rows
- ✅ **materials** - 0 rows  
- ✅ **branch_pcs** - 11 rows

### Export File:
- **File**: `railway-import-2026-01-13.sql`
- **Size**: 5.46 KB
- **Format**: PostgreSQL-compatible SQL

---

## 🚀 Step-by-Step Railway Migration

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (recommended)
3. Verify your email

### Step 2: Create PostgreSQL Database
1. Click **"New Project"**
2. Select **"Provision PostgreSQL"**
3. Wait for database to be created (30 seconds)

### Step 3: Get Database URL
1. Click on your **PostgreSQL service**
2. Go to **"Variables"** tab
3. Find **DATABASE_URL**
4. Click **"Copy"** to copy the full connection string

Example format:
```
postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
```

### Step 4: Import Your Data

Choose ONE of these methods:

#### **Method A: Railway CLI (Recommended)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Import the SQL file
railway run psql -f railway-import-2026-01-13.sql
```

#### **Method B: Direct psql Command**
```bash
# Replace YOUR_RAILWAY_DATABASE_URL with the URL from Step 3
psql "YOUR_RAILWAY_DATABASE_URL" < railway-import-2026-01-13.sql
```

#### **Method C: Manual Import (Simple)**
1. Open `railway-import-2026-01-13.sql` in text editor
2. Copy ALL content (Ctrl+A, Ctrl+C)
3. In Railway dashboard, click **PostgreSQL** → **Query** tab
4. Paste the SQL content
5. Click **"Run Query"**

### Step 5: Verify Import
In Railway Query tab, run:
```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check data
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM branch_pcs;
SELECT COUNT(*) FROM materials;
```

Expected results:
- tasks: 7 rows
- branch_pcs: 11 rows
- materials: 0 rows

### Step 6: Update Your Local .env
Add the Railway DATABASE_URL to your `.env` file:
```env
DATABASE_URL=postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
CLOUDINARY_CLOUD_NAME=dtc0tjfls
CLOUDINARY_API_KEY=745114355726178
CLOUDINARY_API_SECRET=TGM2FiZvItt5moUl1-hO4kvDk78
```

### Step 7: Update Render Configuration
In your `render.yaml`, the DATABASE_URL is already configured to use Render's database. You have two options:

**Option A: Keep using Render's PostgreSQL**
- Keep render.yaml as is
- Import your data to Render's database too

**Option B: Use Railway from Render**
- In Render dashboard → Environment
- Update DATABASE_URL to your Railway URL
- This connects Render app to Railway database

---

## 🔄 Connecting Railway to Your App

### For Local Development:
```bash
# After updating .env with Railway URL
npm start
```

### For Render Deployment:
1. Go to Render dashboard
2. Select your service
3. Go to **Environment** tab
4. Update or add:
   ```
   DATABASE_URL = your_railway_database_url
   ```
5. Save changes
6. Render will auto-redeploy

---

## 🔐 Important Notes

### Why Railway?
- ✅ Free tier: 500 hours/month
- ✅ Automatic backups
- ✅ Better uptime than Render free tier
- ✅ Easier to use
- ✅ Built-in database management UI

### Database Connection from Multiple Places:
You can connect to Railway database from:
- Your local computer (development)
- Render (production backend)
- Any other service (future scaling)

### Security:
- ✅ Railway DATABASE_URL already includes authentication
- ✅ Use environment variables (never hardcode)
- ✅ Keep .env file local (already in .gitignore)

---

## 🧪 Testing the Migration

### Test 1: Local Connection
```bash
node -e "require('dotenv').config(); const {Pool} = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}}); pool.query('SELECT COUNT(*) FROM tasks').then(r => {console.log('✅ Connected! Tasks:', r.rows[0].count); process.exit();}).catch(e => {console.error('❌ Error:', e.message); process.exit(1);});"
```

### Test 2: Check Tables
```bash
node check-database.js
```

### Test 3: Start Server
```bash
npm start
# Should connect to Railway database
# Check console for: ✅ Connected to DB
```

---

## 📋 Exported File Structure

The `railway-import-2026-01-13.sql` file contains:

1. **DROP TABLE** statements (clean start)
2. **CREATE TABLE** statements (schema)
3. **INSERT** statements (your data)

It's PostgreSQL-compatible and includes:
- Auto-incrementing IDs (SERIAL)
- Proper data types
- All relationships
- All existing data

---

## ⚠️ Troubleshooting

### "psql: command not found"
Install PostgreSQL client:
- **Windows**: https://www.postgresql.org/download/windows/
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt install postgresql-client`

### "connection refused"
- Check DATABASE_URL is correct
- Ensure you copied the full URL from Railway
- Check if Railway database is running (green status)

### "syntax error" during import
- Make sure you're using PostgreSQL (not MySQL)
- Check that the SQL file wasn't corrupted
- Try Method C (manual copy-paste)

### Missing image_path columns
After import, run migrations to add Cloudinary columns:
```bash
npm run migrate
```

---

## 🎉 Success Checklist

- [ ] Railway account created
- [ ] PostgreSQL database provisioned
- [ ] DATABASE_URL copied
- [ ] SQL file imported successfully
- [ ] Data verified (correct row counts)
- [ ] Local .env updated
- [ ] Local server connects to Railway
- [ ] Render environment updated (if using Railway)
- [ ] Production app connects to Railway

---

## 📚 Files in This Export

- `railway-import-2026-01-13.sql` - Your database export
- `export-to-railway.js` - Export script (keep for future exports)
- This guide

---

**Your database is ready to migrate to Railway!** 🚂

Follow the steps above, and you'll have your data on Railway in 5-10 minutes.
