# Cloudinary Image Storage Implementation

## Overview
This application now uses **Cloudinary free-tier cloud storage** for all image uploads. Images are stored in the cloud and accessible from any device, persisting across server restarts.

---

## 🎯 What Changed

### ✅ Before (Local Storage)
- Images saved to `public/uploads/` folder
- Files stored on server filesystem
- Lost when server restarts or redeploys
- Not accessible from different servers/devices

### ✅ After (Cloudinary Cloud Storage)
- Images uploaded directly to Cloudinary
- Stored in the cloud permanently
- Accessible from any device via public URL
- Persist across server restarts and redeployments
- **Free tier**: 25GB storage, 25GB bandwidth/month

---

## 🔧 How It Works

### 1. Upload Flow
```
User selects image → Frontend sends via FormData → Backend receives file →
Multer stores in memory (buffer) → Cloudinary SDK uploads to cloud →
Cloudinary returns secure URL → URL saved to database → Frontend displays image
```

### 2. Image Storage Location
- **Cloudinary Folder**: `it-monitoring-dashboard/`
- **URL Format**: `https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/it-monitoring-dashboard/[image_id].[format]`
- **Database**: Only the Cloudinary URL is stored (not local paths)

### 3. Files Modified

#### **New File: `cloudinary-config.js`**
- Configures Cloudinary SDK with credentials from `.env`
- Sets up Multer with memory storage (images temporarily in RAM)
- Provides `uploadToCloudinary()` function to upload buffers to cloud
- Provides `deleteImageFromCloudinary()` to clean up old images
- Exports configured `upload` middleware

#### **Updated: `server.js`**
- Removed local disk storage configuration
- Removed `/uploads` static file route (no longer needed)
- Imports Cloudinary utilities from `cloudinary-config.js`
- Updated POST/PUT routes for `/pcs` and `/inventory`:
  - Checks if file is uploaded (`req.file`)
  - Uploads file buffer to Cloudinary
  - Stores Cloudinary URL in database
  - On update: deletes old Cloudinary image before uploading new one

#### **Updated: `.gitignore`**
- Added `public/uploads/` to ignore local uploads (legacy)
- Added `node_modules/`, `tasks.db`, `*.log`, `.DS_Store`

#### **Updated: `.env`**
- Contains Cloudinary credentials (already configured):
  ```
  CLOUDINARY_CLOUD_NAME=dtc0tjfls
  CLOUDINARY_API_KEY=745114355726178
  CLOUDINARY_API_SECRET=TGM2FiZvItt5moUl1-hO4kvDk78
  ```

---

## 🔑 Environment Variables

The `.env` file already contains your Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=dtc0tjfls
CLOUDINARY_API_KEY=745114355726178
CLOUDINARY_API_SECRET=TGM2FiZvItt5moUl1-hO4kvDk78
```

⚠️ **Never commit `.env` to version control!** (Already in `.gitignore`)

---

## 📝 Database Schema

### PC Images
- **Table**: `branch_pcs`
- **Column**: `pc_image_path` (TEXT)
- **Value**: Full Cloudinary URL (e.g., `https://res.cloudinary.com/dtc0tjfls/image/upload/v1234567890/it-monitoring-dashboard/abc123.jpg`)

### Inventory Part Images
- **Table**: `materials`
- **Column**: `image_path` (TEXT)
- **Value**: Full Cloudinary URL

---

## 🚀 How to Test

### 1. Restart Server
```bash
npm start
```

### 2. Upload a New Image
1. Open the app in your browser
2. Go to **PCs** or **Inventory** page
3. Add a new item with an image
4. Submit the form

### 3. Verify in Database
```bash
# Check PC images
node -e "const {Pool} = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}}); pool.query('SELECT id, branch_name, pc_image_path FROM branch_pcs WHERE pc_image_path IS NOT NULL ORDER BY id DESC LIMIT 5').then(r => console.log(r.rows)).catch(e => console.error(e));"

# Check inventory images
node -e "const {Pool} = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}}); pool.query('SELECT id, name, image_path FROM materials WHERE image_path IS NOT NULL ORDER BY id DESC LIMIT 5').then(r => console.log(r.rows)).catch(e => console.error(e));"
```

### 4. Test Cloudinary URL in Browser
- Copy the `pc_image_path` or `image_path` URL from database
- Paste in browser address bar
- Image should load from Cloudinary

### 5. Test Persistence
1. Upload an image
2. Stop the server (`Ctrl+C`)
3. Restart the server (`npm start`)
4. Open the app → image should still display
5. Open app on a different device → image should load

---

## 🎨 Frontend (No Changes Required)

The frontend already works correctly because:
- It sends images via `FormData` (unchanged)
- It displays images using the `image_path` or `pc_image_path` from database
- Cloudinary URLs work as direct image URLs (same as local `/uploads/...`)

**Example (inventory.js):**
```javascript
// Frontend already does this:
const imageFile = document.getElementById('partImage').files[0];
if (imageFile) {
  formData.append('part_image', imageFile);
}

// Backend now uploads to Cloudinary and returns URL
// Frontend displays: <img src="${part.image_path}">
// This works for both local paths and Cloudinary URLs!
```

---

## 🔍 Why Images Persist

1. **Cloud Storage**: Images are stored on Cloudinary's servers, not your local machine
2. **Database URLs**: Your database stores the Cloudinary URL, not a local file path
3. **No Server Dependency**: Images exist independently of your server's filesystem
4. **Global CDN**: Cloudinary serves images via CDN for fast global access

### Before (Local Storage Problem):
```
Server Restart → public/uploads/ folder cleared → Images lost ❌
```

### After (Cloudinary Solution):
```
Server Restart → Images still on Cloudinary → URLs in database → Images load ✅
```

---

## 📊 Monitoring Uploads

### Check Recent Uploads via API
```bash
curl http://localhost:3000/api/recent-images
```

Response:
```json
{
  "status": "success",
  "materials": {
    "items": [
      {
        "id": 1,
        "name": "Kingston RAM 16GB",
        "part_type": "RAM",
        "image_path": "https://res.cloudinary.com/dtc0tjfls/image/upload/..."
      }
    ],
    "stats": { "total": 10, "withImages": 3 }
  },
  "pcs": {
    "items": [ ... ],
    "stats": { "total": 15, "withImages": 5 }
  }
}
```

---

## ⚙️ Technical Details

### Multer Configuration
- **Storage**: `multer.memoryStorage()` (stores files in RAM temporarily)
- **Size Limit**: 5MB per file
- **Allowed Formats**: JPG, JPEG, PNG, GIF
- **File Access**: `req.file.buffer` (raw bytes)

### Cloudinary Upload
```javascript
// Simplified flow:
const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
const cloudinaryUrl = result.secure_url;
// Save cloudinaryUrl to database
```

### Image Deletion
When updating an image, the old Cloudinary image is automatically deleted:
```javascript
if (req.body.existing_image_path && req.body.existing_image_path.includes('cloudinary.com')) {
  await deleteImageFromCloudinary(req.body.existing_image_path);
}
```

---

## 🆓 Cloudinary Free Tier Limits

- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25 credits/month
- **Images**: Unlimited

**Current Usage**: Check at https://cloudinary.com/console

---

## 🐛 Troubleshooting

### Issue: "Cloudinary upload failed"
- **Check**: Are credentials in `.env` correct?
- **Verify**: Run `node -e "console.log(require('dotenv').config()); console.log(process.env.CLOUDINARY_CLOUD_NAME)"`
- **Solution**: Ensure `.env` is in root directory and server is restarted

### Issue: Images not displaying
- **Check**: Database contains Cloudinary URL (not `/uploads/...`)
- **Solution**: Upload a new image after implementation

### Issue: Old images still showing local paths
- **Expected**: Old images before implementation may still have `/uploads/...` paths
- **Solution**: Re-upload those images to migrate to Cloudinary

---

## ✅ Checklist for Production

- [x] Cloudinary credentials in `.env`
- [x] `.env` in `.gitignore`
- [x] Server imports Cloudinary config
- [x] POST routes upload to Cloudinary
- [x] PUT routes replace old Cloudinary images
- [x] Database stores Cloudinary URLs
- [x] Frontend displays images from URLs
- [ ] Test upload on production server
- [ ] Monitor Cloudinary usage dashboard

---

## 📚 Resources

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Node.js SDK**: https://cloudinary.com/documentation/node_integration
- **Dashboard**: https://cloudinary.com/console

---

**Implementation Complete! 🎉**

All image uploads now go to Cloudinary. Images persist across server restarts and are accessible from any device.
