# 🚀 Backend & Database Deployment Guide

## ✅ Complete Backend Audit Results

All backend code has been audited and enhanced to ensure proper database schema alignment and image upload functionality.

---

## 📋 What Was Fixed/Enhanced

### 1. **Database Schema Enforcement**
- ✅ Added `image_path` column to `materials` table
- ✅ Added `motherboard_serial` column to `branch_pcs` table  
- ✅ Added `pc_image_path` column to `branch_pcs` table
- ✅ All migrations use `IF NOT EXISTS` for safety

### 2. **Migration System Created**
- ✅ **migrations/001_add_image_columns.sql** - SQL migration file
- ✅ **run-migrations.js** - Migration runner with tracking
- ✅ Migrations table tracks executed migrations
- ✅ Transaction support (ROLLBACK on failure)

### 3. **Enhanced Server Initialization**
- ✅ Improved schema verification on startup
- ✅ Detailed logging for each column check
- ✅ `verifySchema()` function confirms all columns exist
- ✅ Better error messages for troubleshooting

### 4. **Diagnostic Tools**
- ✅ **verify-schema.js** - Comprehensive schema checker
- ✅ **GET /api/health** - Health check endpoint
- ✅ **GET /api/schema-check** - Live schema inspection
- ✅ All accessible via npm scripts

### 5. **Error Handling**
- ✅ Multer error middleware for file upload issues
- ✅ File size limit validation (5MB)
- ✅ File type validation (JPG, PNG, GIF)
- ✅ Proper error messages returned to client

### 6. **Render Deployment Configuration**
- ✅ **render.yaml** - Blueprint for Render deployment
- ✅ Start command runs migrations before server
- ✅ Environment variables properly configured
- ✅ Database connection with SSL

---

## 🔧 NPM Scripts Available

```bash
# Production start (runs migrations first)
npm start

# Development start (skip migrations)
npm run start:dev

# Run migrations only
npm run migrate

# Verify database schema
npm run verify
```

---

## 🗄️ Database Schema Reference

### Materials Table (Inventory/Parts)
```sql
CREATE TABLE materials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  part_type TEXT,
  status TEXT DEFAULT 'Available',
  serial_number TEXT,
  warranty_date TEXT,
  condition TEXT DEFAULT 'Good',
  image_path TEXT,  -- ⭐ NEW COLUMN
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Branch PCs Table (PC Specifications)
```sql
CREATE TABLE branch_pcs (
  id SERIAL PRIMARY KEY,
  branch_name TEXT,
  city TEXT,
  branch_code TEXT,
  desktop_name TEXT,
  pc_number TEXT,
  motherboard TEXT,
  motherboard_serial TEXT,  -- ⭐ NEW COLUMN
  processor TEXT,
  storage TEXT,
  ram TEXT,
  psu TEXT,
  monitor TEXT,
  pc_image_path TEXT  -- ⭐ NEW COLUMN
);
```

---

## 🚀 Render Deployment Steps

### Option 1: Automatic (Using render.yaml)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Add image upload features with migrations"
   git push origin main
   ```

2. **Create Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Click "Apply" to create services

3. **Verify Deployment**
   - Check deployment logs for migration execution
   - Visit: `https://your-app.onrender.com/api/health`
   - Visit: `https://your-app.onrender.com/api/schema-check`

### Option 2: Manual Setup

1. **Create PostgreSQL Database**
   - New + → PostgreSQL
   - Name: `it-dashboard-db`
   - Plan: Free
   - Copy the "Internal Database URL"

2. **Create Web Service**
   - New + → Web Service
   - Connect repository
   - Settings:
     - **Name**: it-monitoring-dashboard
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment Variables**:
       - `DATABASE_URL` = [paste Internal Database URL]
       - `NODE_VERSION` = `18`

3. **Deploy**
   - Click "Create Web Service"
   - Watch logs for migration execution
   - Verify health check

---

## 🔍 Verification Steps

### 1. Local Verification (Before Deploying)

```bash
# Set your local DATABASE_URL
export DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# Or on Windows PowerShell:
$env:DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# Run verification
npm run verify
```

**Expected Output:**
```
🔍 Starting database schema verification...

✅ Database connection successful
📋 Checking MATERIALS table...
✅ materials table exists
   ✅ image_path
📋 Checking BRANCH_PCS table...
✅ branch_pcs table exists
   ✅ motherboard_serial
   ✅ pc_image_path

🎉 VERIFICATION PASSED!
```

### 2. Test Migrations Locally

```bash
npm run migrate
```

**Expected Output:**
```
🔄 Starting database migrations...
✅ Database connection successful
✅ Migrations tracking table ready
📁 Found 1 migration file(s)
🔧 Executing migration: 001_add_image_columns.sql
✅ Migration 001_add_image_columns.sql completed successfully
🎉 All migrations completed successfully!
```

### 3. Production Verification (After Deploying)

**Via Endpoints:**
```bash
# Health check
curl https://your-app.onrender.com/api/health

# Schema check
curl https://your-app.onrender.com/api/schema-check
```

**Via Render Dashboard:**
1. Go to your Web Service
2. Click "Logs" tab
3. Look for these log lines:
   ```
   🔄 Starting database migrations...
   ✅ Migration completed
   ✅ materials.image_path verified
   ✅ branch_pcs.motherboard_serial verified
   ✅ branch_pcs.pc_image_path verified
   🎉 Database schema initialization complete!
   ✅ Server running at http://localhost:10000
   ```

---

## 🐛 Troubleshooting

### Issue: "Column does not exist"

**Solution 1: Run migrations manually**
```bash
npm run migrate
```

**Solution 2: Force redeploy on Render**
1. Go to Render Dashboard
2. Click "Manual Deploy" → "Clear build cache & deploy"

**Solution 3: Connect to database directly**
```bash
# Use Render Shell or local psql
psql $DATABASE_URL

# Run migration SQL manually
\i migrations/001_add_image_columns.sql
```

### Issue: Migration already executed but columns missing

**Check migration tracking:**
```sql
SELECT * FROM migrations;
```

**If migration is marked as executed but columns missing:**
```sql
-- Delete the migration record to re-run
DELETE FROM migrations WHERE name = '001_add_image_columns.sql';
```

Then redeploy or run `npm run migrate`.

### Issue: File upload fails with "Column does not exist"

**Verify columns exist:**
```bash
# Use verify script
npm run verify

# Or query directly
psql $DATABASE_URL -c "\d materials"
psql $DATABASE_URL -c "\d branch_pcs"
```

**If columns missing, add manually:**
```sql
ALTER TABLE materials ADD COLUMN IF NOT EXISTS image_path TEXT;
ALTER TABLE branch_pcs ADD COLUMN IF NOT EXISTS motherboard_serial TEXT;
ALTER TABLE branch_pcs ADD COLUMN IF NOT EXISTS pc_image_path TEXT;
```

### Issue: Render deployment fails

**Check logs for:**
- Database connection errors → Verify DATABASE_URL is set
- Migration errors → Check SQL syntax
- Permission errors → Ensure database user has ALTER TABLE rights

**Force clean deploy:**
1. Settings → "Clear build cache & deploy"
2. Check "Environment Variables" tab
3. Verify `DATABASE_URL` is present and correct

---

## 📝 Environment Variables

### Required on Render:

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-set by Render when linking database |
| `NODE_VERSION` | `18` | Manual |
| `SESSION_SECRET` | Random secure string | Manual (optional, has default) |

### Setting Environment Variables:

1. Go to Web Service dashboard
2. Click "Environment" tab
3. Add variables
4. Click "Save Changes"
5. Service will auto-redeploy

---

## ✅ Final Checklist

Before marking as complete:

- [ ] All migrations in `migrations/` directory
- [ ] `npm run verify` passes locally
- [ ] `npm start` works locally
- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] DATABASE_URL environment variable set
- [ ] Deployment successful (check logs)
- [ ] `/api/health` returns healthy
- [ ] `/api/schema-check` shows all columns
- [ ] Test image upload in inventory
- [ ] Test image upload in PC specs
- [ ] Images display correctly
- [ ] No console errors in browser
- [ ] No server errors in Render logs

---

## 🎯 Success Criteria

Your deployment is successful when:

1. ✅ Server starts without errors
2. ✅ Migrations execute automatically
3. ✅ All three new columns exist in database
4. ✅ Health check endpoint returns "healthy"
5. ✅ Schema check shows all required columns
6. ✅ Image uploads work for parts
7. ✅ Image uploads work for PCs
8. ✅ Images display correctly in UI
9. ✅ No "column does not exist" errors

---

## 📞 Quick Commands Reference

```bash
# Verify schema
npm run verify

# Run migrations
npm run migrate

# Start with migrations (production)
npm start

# Start without migrations (dev)
npm run start:dev

# Check database directly (if you have psql)
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'materials';"
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'branch_pcs';"
```

---

**🎉 Backend is production-ready with complete database schema enforcement!**
