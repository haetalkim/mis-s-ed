# GitHub Pages Deployment Guide

## Quick Setup

### Option 1: Deploy from `src` folder (Recommended)

1. **Initialize Git repository** (if not already done):
   ```bash
 cd /Users/jiinhur/Downloads/missed-11-22
 git init
 git add .
 git commit -m "Initial commit"
 ```

2. **Create GitHub repository**:
   - Go to GitHub.com and create a new repository
   - Don't initialize with README

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **Deploy from a branch**
   - Select **Branch**: `main`
   - Select **Folder**: `/src`
   - Click **Save**

5. **Your site will be live at**:
   `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

### Option 2: Deploy from root folder

If you prefer to deploy from root:

1. **Copy files to root**:
   ```bash
   cp src/index.html .
   cp src/script.js .
   cp src/style.css .
   ```

2. **Update paths in index.html** (they should already be correct)

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Move files to root for GitHub Pages"
   git push
   ```

4. **Enable GitHub Pages**:
   - Settings → Pages
   - Source: `main` branch, `/ (root)` folder

## Common Issues & Fixes

### Issue: "Page not found" or blank page
- **Fix**: Make sure GitHub Pages is enabled and pointing to the correct folder
- **Fix**: Check that `index.html` is in the root of the selected folder

### Issue: CSS/JS not loading
- **Fix**: Check browser console for 404 errors
- **Fix**: Ensure file paths are relative (not absolute)
- **Fix**: Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: External images not loading
- **Fix**: Some external image URLs may have expired or require authentication
- **Fix**: Consider hosting images in the repository or using a CDN

### Issue: JavaScript errors
- **Fix**: Open browser DevTools (F12) and check Console tab
- **Fix**: Make sure `script.js` is loaded after HTML content

## Testing Locally

Before deploying, test locally:

```bash
# Using Python 3
cd src
python3 -m http.server 8000

# Or using Node.js (if you have http-server installed)
npx http-server src -p 8000
```

Then visit: `http://localhost:8000`

## File Structure

Your repository should look like:
```
missed-11-22/
├── src/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── README.md
└── LICENSE.txt
```

