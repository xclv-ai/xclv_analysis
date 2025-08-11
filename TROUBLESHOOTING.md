# XCLV Extension Loading Troubleshooting

## "Failed to load extension" Error Fix

If you're seeing errors like:
```
Could not load icon 'icons/icon-16.png' specified in 'icons'.
Could not load manifest.
```

## Quick Fix Steps

### 1. Fresh Clone (Recommended)
```bash
# Remove your current local copy
rm -rf ~/Documents/GitHub/xclv_analysis

# Fresh clone from GitHub
cd ~/Documents/GitHub/
git clone https://github.com/xclv-ai/xclv_analysis.git

# Navigate to the extension directory
cd xclv_analysis
```

### 2. Verify All Files
```bash
# Run the verification script
node verify-extension.js
```

### 3. Load Extension in Chrome
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **"Load unpacked"**
5. Select your `xclv_analysis` directory
6. The extension should load without errors

## Alternative: Manual File Check

If you prefer to keep your current directory, verify these files exist:

**Required Files:**
- ✅ `manifest.json`
- ✅ `background.js` 
- ✅ `content.js`
- ✅ `content-styles.css`
- ✅ `popup.html`
- ✅ `popup.js`
- ✅ `options.html`
- ✅ `options.js`

**Required Icons:**
- ✅ `icons/icon-16.png`
- ✅ `icons/icon-32.png` 
- ✅ `icons/icon-48.png`
- ✅ `icons/icon-128.png`

## Common Issues

### File Permissions
```bash
# Fix file permissions if needed
chmod -R 755 ./xclv_analysis/
```

### Git Sync Issues
```bash
# Force pull latest changes
git reset --hard origin/main
git pull origin main
```

### Cache Issues
1. Clear Chrome extension cache
2. Restart Chrome browser
3. Try loading extension again

## Success Indicators

When properly loaded, you should see:
- ✅ Extension appears in Chrome extensions list
- ✅ XCLV icon appears in Chrome toolbar
- ✅ No error messages in extension details
- ✅ Popup opens when clicking the icon

## Still Having Issues?

Check the Chrome DevTools console:
1. Right-click the extension popup
2. Select "Inspect"
3. Look for any JavaScript errors
4. Share the error messages for further troubleshooting

The extension is ready to analyze brand content on any webpage! 🚀
