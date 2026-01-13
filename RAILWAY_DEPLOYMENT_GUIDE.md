# Railway Deployment Guide

## Prerequisites
✅ Railway account (free tier available)
✅ Railway PostgreSQL database already set up (connected)
✅ Code pushed to GitHub

## Deployment Steps

### 1. Create New Railway Project
1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `IT-Monitoring-Dashboard-main`

### 2. Configure Environment Variables
In Railway dashboard → Your service → **Variables** tab, add:

```
DATABASE_URL=${{Postgres.DATABASE_PUBLIC_URL}}
CLOUDINARY_CLOUD_NAME=dtc0tjfls
CLOUDINARY_API_KEY=745114355726178
CLOUDINARY_API_SECRET=TGM2FiZvItt5moUl1-hO4kvDk78
PORT=3000
NODE_ENV=production
```

**Note:** `${{Postgres.DATABASE_PUBLIC_URL}}` automatically references your Railway PostgreSQL database.

### 3. Link Database Service
1. In Railway dashboard → Your web service
2. Click **"Variables"** tab
3. Click **"+ New Variable"** → **"Add Reference"**
4. Select your PostgreSQL database
5. Choose `DATABASE_PUBLIC_URL`

### 4. Configure Networking
1. In Railway dashboard → Your service → **Settings**
2. Under **"Networking"** → Click **"Generate Domain"**
3. Copy your Railway domain (e.g., `your-app.up.railway.app`)

### 5. Deploy
Railway automatically deploys when you push to GitHub!

```bash
git add .
git commit -m "Configure Railway deployment"
git push origin main
```

Railway will:
- ✅ Install dependencies (`npm install`)
- ✅ Run migrations (`node run-migrations.js`)
- ✅ Start server (`node server.js`)

### 6. Monitor Deployment
- Check **"Deployments"** tab for build logs
- Check **"Logs"** tab for runtime logs
- Look for: `✅ Connected to DB` and `🚀 Server running on port 3000`

## Post-Deployment

### Test Your App
Visit your Railway domain:
```
https://your-app.up.railway.app
```

### View Logs
```bash
# Install Railway CLI (optional)
npm i -g @railway/cli

# Login
railway login

# View logs
railway logs
```

## Troubleshooting

### Build Failed
- Check **Deployments** tab for error messages
- Verify `package.json` has all dependencies
- Check Node.js version compatibility

### Database Connection Error
- Verify `DATABASE_URL` variable is set
- Check database service is running
- Ensure SSL is configured: `ssl: { rejectUnauthorized: false }`

### Port Issues
- Railway automatically assigns PORT via environment variable
- Your code uses: `const PORT = process.env.PORT || 3000` ✅

## Environment Variables Summary

| Variable | Source | Description |
|----------|--------|-------------|
| `DATABASE_URL` | Railway (reference) | PostgreSQL connection string |
| `CLOUDINARY_CLOUD_NAME` | Manual | Cloud storage for images |
| `CLOUDINARY_API_KEY` | Manual | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Manual | Cloudinary secret |
| `PORT` | Railway (auto) | Server port (auto-assigned) |
| `NODE_ENV` | Manual | Set to `production` |

## Automatic Deployments

Railway monitors your GitHub repo. Every push to `main` triggers:
1. 🔄 Pull latest code
2. 📦 Install dependencies
3. 🗄️ Run migrations
4. 🚀 Start server
5. ✅ Health check

## Scaling (Optional)

Free tier limits:
- 500 hours/month
- $5 credit/month
- Shared resources

Upgrade for:
- Custom domains
- More resources
- Team features

---

**Your Railway Database:** Already connected!
- Database: `railway`
- Data: 7 tasks, 11 PCs, 7 materials ✅
