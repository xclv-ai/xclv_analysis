# Changelog

All notable changes to the XCLV Brand Analysis Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.5] - 2025-08-11

### 🚀 Major Features
- **NEW: Dynamic Prompt System** - Professional-grade prompts stored in separate .md files for easy maintenance
- **NEW: Advanced Tone of Voice Analysis** - Nielsen Norman Group's Core Four Dimensions framework implementation
- **NEW: Brand Archetype Analysis** - Complete Jung's 12 archetypes identification system
- **NEW: Modular Prompt Architecture** - Extensible system supporting multiple analysis types

### 📝 Prompt Library
- **tone-of-voice-analysis.md** - Advanced ToV analysis with Feynman-style insights
- **brand-archetype-analysis.md** - Comprehensive archetype identification system
- **text-element-analysis.md** - Individual text element effectiveness evaluation
- **comprehensive-brand-analysis.md** - Complete brand intelligence analysis

### 🔧 Technical Improvements
- **Enhanced Background Service** - Dynamic prompt loading with fallback system
- **Improved API Response Parsing** - Better error handling for Gemini API responses
- **Fixed Debug Interface Issues** - System prompts now properly stored and displayed
- **Better Error Recovery** - Graceful handling of missing prompts or API failures

### 🛡️ Reliability Enhancements
- **Fallback Prompt System** - Built-in prompts when .md files can't be loaded
- **Enhanced Error Messages** - More specific error reporting for debugging
- **Improved Response Validation** - Better handling of malformed API responses
- **Robust Initialization** - Multiple retry mechanisms for service startup

### 🧪 Testing Requirements
- Test prompt loading functionality
- Verify fallback prompts work when files are missing
- Confirm debug interface shows system prompts correctly
- Validate all analysis types produce expected outputs

---

## [1.2.4] - 2025-08-11

### 🔧 Critical Fixes
- **FIXED: API Key Saving** - Resolved major issue where Gemini API keys wouldn't save properly
- **FIXED: Button Functionality** - All popup buttons now work correctly with proper event handlers
- **FIXED: JavaScript Syntax Errors** - Cleaned up escaped newlines and syntax issues in popup.js
- **FIXED: Storage Persistence** - Settings now properly persist between browser sessions
- **FIXED: Background Service Communication** - Improved message passing between popup and background

### 🛡️ Security & Validation
- Added API key length validation (minimum 20 characters)
- Enhanced error handling with user-friendly feedback messages
- Improved input validation for all form fields
- Better error recovery for API connection failures

### 🔧 Technical Improvements
- Enhanced `saveApiSettings()` with proper validation and error handling
- Improved `testApiConnection()` with better feedback and model display
- Fixed event listener binding for all popup controls
- Added comprehensive try-catch blocks throughout popup controller
- Proper cleanup of escaped characters and newlines in JavaScript

### 📋 Code Quality
- All JavaScript now passes syntax validation
- Improved error messages and user feedback
- Enhanced debugging capabilities
- Better separation of concerns in popup controller

---

## [1.2.3] - 2025-08-10

### 🆕 New Features
- Interactive mouseover analysis with animated content frames
- Debug popup interface with multi-tab debugging
- Real-time element highlighting and analysis
- Advanced debugging tools for development

### 🔧 Improvements
- Enhanced content extraction algorithms
- Improved analysis accuracy with Gemini 2.5
- Better user interface responsiveness
- Optimized performance for large pages

---

## [1.2.2] - 2025-08-09

### 🔧 Bug Fixes
- Fixed content script loading issues
- Improved CSS styling conflicts resolution
- Better error handling for network failures

---

## [1.2.1] - 2025-08-08

### 🔧 Minor Fixes
- Updated manifest permissions
- Improved extension icon visibility
- Fixed keyboard shortcuts on different platforms

---

## [1.2.0] - 2025-08-07

### 🆕 Major Features
- **Interactive Mouseover Analysis** - Hover over text elements for instant insights
- **Debug Interface** - Comprehensive debugging with system prompt visibility
- **One-Click Analysis** - Instant brand intelligence with animated feedback
- **Multi-Tab Debugging** - Separate tabs for content, prompts, outputs, and raw data

### 🎯 Analysis Enhancements
- Smart element detection for text analysis
- Context-aware brand evaluation
- Real-time clarity scoring
- Enhanced archetype detection

### 🔧 Technical Upgrades
- Improved content extraction engine
- Better caching and performance optimization
- Enhanced error handling and recovery
- Streamlined API communication

---

## [1.1.0] - 2025-08-05

### 🆕 Features
- Brand archetype analysis (12 core archetypes)
- Cultural alignment assessment
- Export functionality for analysis reports
- Live scoreboard for real-time metrics

### 🔧 Improvements
- Enhanced tone analysis accuracy
- Better UI/UX with modern design
- Improved API error handling
- Optimized content parsing

---

## [1.0.0] - 2025-08-01

### 🚀 Initial Release
- Core brand analysis engine
- Tone of voice detection (formality, warmth, authority, authenticity, innovation)
- Gemini 2.5 AI integration
- Real-time webpage analysis
- Chrome extension popup interface
- Basic settings and configuration

### 📋 Core Features
- Brand intelligence analysis
- LiveBranding methodology implementation
- Strategic insights and recommendations
- Chrome browser integration

---

## 🛡️ Development Guidelines

### Version Numbering
- **Major (X.0.0)**: Breaking changes, major feature additions
- **Minor (1.X.0)**: New features, significant improvements, new prompt systems
- **Patch (1.2.X)**: Bug fixes, minor improvements, stability updates

### Prompt System Guidelines (NEW in v1.2.5)
1. **Prompt Organization**: All prompts stored in `/prompts/*.md` files
2. **Template Variables**: Use `{{variable}}` syntax for dynamic content
3. **Fallback System**: Always include built-in prompts for critical functionality
4. **Testing**: Verify both file-based and fallback prompts work correctly
5. **Documentation**: Update prompt descriptions when adding new analysis types

### Code Quality Standards
1. **JavaScript Validation**: All code must pass ESLint without errors
2. **Syntax Checking**: No escaped newlines or syntax errors
3. **Error Handling**: Comprehensive try-catch blocks required
4. **User Feedback**: Clear success/error messages for all operations
5. **Testing**: Manual testing required for all popup functionality
6. **Prompt Testing**: Verify all prompt files load correctly

### Pre-Release Checklist
- [ ] Test API key saving and validation
- [ ] Verify all button functionality
- [ ] Check JavaScript console for errors
- [ ] Test settings persistence
- [ ] Validate background service communication
- [ ] **NEW: Test prompt loading system**
- [ ] **NEW: Verify fallback prompts work**
- [ ] **NEW: Validate all analysis types**
- [ ] Update version number in manifest.json
- [ ] Update README.md with changes
- [ ] Update CHANGELOG.md with new version

### Critical Files to Monitor
- `popup.js` - Main popup controller (frequent syntax issues)
- `manifest.json` - Version and permissions
- `background.js` - API service and message handling
- `content.js` - Page interaction and analysis
- **NEW: `prompts/*.md`** - Analysis prompt definitions

### Prompt Management Best Practices
1. **File Naming**: Use kebab-case for prompt filenames
2. **Template Variables**: Always validate variable substitution
3. **Error Handling**: Graceful fallback when prompts fail to load
4. **Performance**: Cache loaded prompts to avoid repeated file reads
5. **Version Control**: Track prompt changes in CHANGELOG.md

---

## 📊 Version Statistics

| Version | Release Date | Major Features | Bug Fixes | Breaking Changes | Prompts Added |
|---------|-------------|----------------|-----------|------------------|---------------|
| 1.2.5   | 2025-08-11  | 1              | 3         | 0                | 4             |
| 1.2.4   | 2025-08-11  | 0              | 5         | 0                | 0             |
| 1.2.3   | 2025-08-10  | 1              | 0         | 0                | 0             |
| 1.2.2   | 2025-08-09  | 0              | 3         | 0                | 0             |
| 1.2.1   | 2025-08-08  | 0              | 3         | 0                | 0             |
| 1.2.0   | 2025-08-07  | 4              | 0         | 0                | 0             |
| 1.1.0   | 2025-08-05  | 4              | 0         | 0                | 0             |
| 1.0.0   | 2025-08-01  | 6              | 0         | 0                | 0             |

---

## 🤝 Contributing

When contributing to this project:

1. **Always update this CHANGELOG.md** with your changes
2. **Follow the version numbering guidelines**
3. **Test all functionality manually** before submitting
4. **Update README.md** if adding new features
5. **Include clear commit messages** describing the changes
6. **NEW: Test prompt system thoroughly** when making prompt changes

### Commit Message Format
- `🔧 Fix:` Bug fixes and stability improvements
- `🆕 Feature:` New functionality additions
- `📝 Docs:` Documentation updates
- `🛡️ Security:` Security-related changes
- `🎨 Style:` UI/UX improvements
- `⚡ Performance:` Performance optimizations
- `📋 Prompts:` Prompt system changes and additions

### Prompt Development Guidelines
- Use clear, specific instructions in prompts
- Include examples where helpful
- Test with various content types
- Document expected output format
- Provide fallback handling for missing variables

---

*This changelog ensures transparency and helps prevent regressions in future development.*
