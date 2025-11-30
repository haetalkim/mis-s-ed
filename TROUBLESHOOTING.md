# Troubleshooting Guide

## Common Issues When Deploying to GitHub Pages

### 1. **Blank/White Page**
**Symptoms**: Page loads but shows nothing

**Possible Causes & Fixes**:
- ✅ Check browser console (F12 → Console tab) for JavaScript errors
- ✅ Verify all files are committed and pushed to GitHub
- ✅ Make sure GitHub Pages is pointing to the correct folder (`/src` or `/`)
- ✅ Check that `index.html` exists in the selected folder
- ✅ Wait 1-2 minutes after enabling GitHub Pages (deployment takes time)

### 2. **CSS Not Loading**
**Symptoms**: Page loads but has no styling

**Fixes**:
- ✅ Check that `style.css` is in the same folder as `index.html`
- ✅ Verify the path in `index.html`: `<link rel="stylesheet" href="style.css">`
- ✅ Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- ✅ Check Network tab in DevTools to see if `style.css` returns 404

### 3. **JavaScript Not Working**
**Symptoms**: Buttons don't work, features don't function

**Fixes**:
- ✅ Check browser console for JavaScript errors
- ✅ Verify `script.js` is loaded: Check Network tab in DevTools
- ✅ Make sure the script tag is at the bottom of `index.html`: `<script src="script.js"></script>`
- ✅ Check for syntax errors in `script.js`

### 4. **Images Not Loading**
**Symptoms**: Broken image icons or missing images

**Fixes**:
- ✅ External image URLs may have expired (check the URLs in `index.html`)
- ✅ Consider hosting images in the repository instead of using external URLs
- ✅ Check Network tab to see which images are failing to load

### 5. **404 Errors**
**Symptoms**: Console shows "Failed to load resource" errors

**Fixes**:
- ✅ All file paths must be relative (e.g., `style.css` not `/style.css`)
- ✅ Check that all referenced files exist in the repository
- ✅ Verify file names match exactly (case-sensitive on GitHub)

### 6. **LocalStorage Issues**
**Symptoms**: Data not persisting, login not working

**Fixes**:
- ✅ This is normal - localStorage is browser-specific
- ✅ Test in the same browser where you expect it to work
- ✅ Clear localStorage if testing: `localStorage.clear()` in console

## Quick Debugging Steps

1. **Open Browser DevTools** (F12 or Right-click → Inspect)
2. **Check Console Tab** - Look for red error messages
3. **Check Network Tab** - See which files are loading (green) vs failing (red)
4. **Check Elements Tab** - Verify HTML structure is correct

## Testing Checklist

Before deploying:
- [ ] Test locally using `python3 -m http.server 8000`
- [ ] Check browser console for errors
- [ ] Verify all features work (login, navigation, etc.)
- [ ] Test on mobile view (DevTools → Toggle device toolbar)
- [ ] Check that all images load
- [ ] Verify CSS is applied correctly

## GitHub Pages Specific Issues

### Issue: "Your site is ready to be published"
**Fix**: Wait 1-2 minutes, then refresh. GitHub needs time to build.

### Issue: "404 File not found"
**Fix**: 
- Make sure you're using the correct URL format: `https://USERNAME.github.io/REPO_NAME/`
- If using `/src` folder: `https://USERNAME.github.io/REPO_NAME/` (should still work)
- Check Settings → Pages to verify the source folder

### Issue: Changes not showing up
**Fix**:
- Wait 1-2 minutes for GitHub to rebuild
- Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
- Check if your latest commit is pushed

## Still Having Issues?

1. **Check the browser console** - Most errors will show there
2. **Compare local vs deployed** - Does it work locally but not on GitHub?
3. **Check file paths** - Are they all relative?
4. **Verify all files are committed** - Run `git status` to check

