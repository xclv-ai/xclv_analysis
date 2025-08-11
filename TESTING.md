# TESTING.md - Extension Quality Assurance

## 🧪 Pre-Deployment Testing Guide

**CRITICAL**: Always run these tests before making any code changes to prevent breaking the extension.

### 🚀 Quick Validation

Run the automated validation script:
```bash
node verify-extension.js
```

This script checks for:
- ✅ JavaScript syntax errors
- ✅ Missing files and dependencies  
- ✅ Manifest validation
- ✅ Event handler verification
- ✅ API integration checks

### 📋 Manual Testing Checklist

#### 1. Extension Loading
- [ ] Extension loads in Chrome without errors
- [ ] Check Chrome DevTools console for JavaScript errors
- [ ] Verify extension icon appears in browser toolbar
- [ ] No red error badges on extension in chrome://extensions/

#### 2. Popup Interface (CRITICAL - Common Break Point)
- [ ] Click extension icon - popup opens correctly
- [ ] All buttons are visible and clickable
- [ ] No JavaScript errors in popup console (F12)

**API Configuration:**
- [ ] Enter API key in input field
- [ ] API key input accepts text and shows characters
- [ ] Click "Save" button - should show success message
- [ ] Click "Test" button - should verify API connection
- [ ] Model selection dropdown works correctly

**Button Functionality:**
- [ ] "Start Analysis" button - changes text when clicked
- [ ] "Enable Interactive Mode" button - toggles correctly
- [ ] "Show Analysis Panel" button - responds to clicks
- [ ] "Export Report" button - shows appropriate state

**Settings Toggles:**
- [ ] Real-time Analysis toggle - visual state changes
- [ ] Hover Insights toggle - visual state changes  
- [ ] Live Scoreboard toggle - visual state changes

#### 3. API Integration
- [ ] API key saves and persists between browser sessions
- [ ] Test API connection works with valid key
- [ ] Error messages display for invalid keys
- [ ] Background service receives API settings

#### 4. Content Analysis
- [ ] Navigate to a content-rich webpage
- [ ] Click "Start Analysis" - should work without errors
- [ ] Interactive mode enables/disables correctly
- [ ] Analysis results display in popup
- [ ] Export functionality works

#### 5. Settings Persistence
- [ ] Close and reopen popup - settings retained
- [ ] Restart Chrome - API key and settings persist
- [ ] Settings sync between popup and content script

### 🔧 Common Issues to Check

#### JavaScript Syntax
```bash
# Check for escaped newlines that break JavaScript
grep -n "\\\\n" popup.js
# Should return no results

# Check for unmatched quotes
node -c popup.js
node -c background.js  
node -c content.js
```

#### Event Handlers
Open popup and check browser console for:
```javascript
// Should not see these errors:
"Cannot read property 'addEventListener' of null"
"TypeError: element is null"
"Uncaught ReferenceError"
```

#### Storage API
Test in browser console:
```javascript
// Should work without errors:
chrome.storage.local.set({test: "value"})
chrome.storage.local.get("test")
```

### 🚨 Emergency Debugging

If the extension breaks:

#### 1. Check Extension Console
- Go to `chrome://extensions/`
- Click "Details" on XCLV extension
- Click "Inspect views: popup" 
- Look for red errors in console

#### 2. Check Background Script
- In chrome://extensions/, click "Inspect views: service worker"
- Check for errors in background script console

#### 3. Check Content Script
- On any webpage, press F12
- Look for XCLV-related errors in console
- Check if content scripts are loading

#### 4. Validate Files
```bash
# Quick file check:
ls -la manifest.json popup.html popup.js background.js content.js

# Check manifest syntax:
python -m json.tool manifest.json

# Check for critical popup issues:
grep -n "addEventListener" popup.js
grep -n "getElementById" popup.js
```

### 🛡️ Prevention Guidelines

#### Code Changes
1. **Never edit JavaScript directly in GitHub web interface**
2. **Always test locally before committing**
3. **Run `node verify-extension.js` before every commit**
4. **Check browser console after every change**

#### Version Management
1. **Always increment version number in manifest.json**
2. **Update CHANGELOG.md with all changes**
3. **Test with new version number**

#### API Changes
1. **Test API integration with real Gemini key**
2. **Verify error handling for invalid keys**
3. **Check network requests in DevTools**

### 📊 Testing Matrix

| Component | Manual Test | Automated Check | Critical Level |
|-----------|-------------|----------------|----------------|
| Popup Interface | ✅ Required | ✅ Script | 🔴 Critical |
| API Key Saving | ✅ Required | ✅ Script | 🔴 Critical |
| Button Events | ✅ Required | ⚠️ Visual | 🔴 Critical |
| Content Analysis | ✅ Required | ⚠️ Manual | 🟡 Important |
| Settings Persistence | ✅ Required | ⚠️ Manual | 🟡 Important |
| Export Function | ⚠️ Optional | ❌ None | 🟢 Nice-to-have |

### 🚀 Release Checklist

Before releasing any version:

- [ ] Run `node verify-extension.js` - no errors
- [ ] Manual popup testing - all buttons work
- [ ] API key save/test cycle - works correctly
- [ ] Load extension in clean Chrome profile
- [ ] Test on 2-3 different websites
- [ ] Version number updated in manifest.json
- [ ] CHANGELOG.md updated with changes
- [ ] README.md updated if new features
- [ ] All commits have clear messages

### 🔧 Developer Tools Setup

For consistent testing environment:

```bash
# Install dependencies:
npm install -g eslint

# Create testing alias:
alias test-xclv="node verify-extension.js && echo '✅ Ready for testing'"

# Chrome flags for testing:
google-chrome --disable-extensions-except=/path/to/xclv_analysis --disable-extensions-file-access-check
```

### 📞 Getting Help

If tests fail:

1. **Check CHANGELOG.md** for known issues
2. **Search GitHub Issues** for similar problems  
3. **Run validation script** for specific error details
4. **Create GitHub Issue** with full error logs and testing environment

---

**Remember**: A 5-minute test prevents hours of debugging. Always validate before committing! 🛡️
