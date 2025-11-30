# Quick Start - Deploy to GitHub Pages

## Step-by-Step Instructions

### 1. Initialize Git (if not done)
```bash
cd /Users/jiinhur/Downloads/missed-11-22
git init
git add .
git commit -m "Initial commit"
```

### 2. Create GitHub Repository
1. Go to https://github.com/new
2. Name your repository (e.g., `missed-app`)
3. **Don't** check "Initialize with README"
4. Click "Create repository"

### 3. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```
*(Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual values)*

### 4. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under **Source**:
   - Select **Deploy from a branch**
   - Branch: `main`
   - Folder: `/src` ⚠️ **Important: Select `/src` folder**
   - Click **Save**

### 5. Wait & Access
- Wait 1-2 minutes for GitHub to build
- Your site will be at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Why It Might Be Breaking

### Most Common Issues:

1. **Wrong Folder Selected**
   - ❌ If you select `/ (root)`, it won't find the files
   - ✅ Must select `/src` folder (where your files are)

2. **Files Not Committed**
   - Run `git status` to check
   - Make sure `src/index.html`, `src/script.js`, `src/style.css` are all committed

3. **Cache Issues**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or open in incognito/private window

4. **JavaScript Errors**
   - Open browser DevTools (F12)
   - Check Console tab for red errors
   - Common: Missing elements, undefined functions

5. **Path Issues**
   - All paths should be relative (✅ `style.css` not ❌ `/style.css`)
   - Your current paths are correct!

## Test Locally First

Before deploying, test locally:
```bash
cd src
python3 -m http.server 8000
```
Then open: http://localhost:8000

If it works locally but not on GitHub, it's likely a folder/path issue.

## Need Help?

1. Check browser console (F12) for errors
2. Check Network tab to see which files fail to load
3. Verify GitHub Pages settings point to `/src` folder
4. Check that all files are in the repository

