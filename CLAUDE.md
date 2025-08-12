# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **XCLV Brand Analysis Chrome Extension** (v1.2.34), a strategic brand intelligence tool that provides real-time tone-of-voice analysis powered by Google Gemini AI. The extension uses the Nielsen Norman Group framework and Jung's Brand Archetypes for comprehensive brand analysis.

**Core Purpose**: Transform webpages into brand analysis laboratories with interactive click-to-analyze functionality, secure API key storage, and evidence-based insights.

## Architecture

### Main Components

- **`manifest.json`** - Chrome Extension Manifest V3 configuration
- **`background.js`** - Service worker handling AI API integration with Google Gemini
- **`content.js`** - Content script for DOM interaction and user interface
- **`popup.html/js/css`** - Extension popup interface for controls and settings
- **`content-styles.css`** - Styling for analysis panels and overlays
- **`options.html/js`** - Advanced settings and configuration page

### Key Classes

- **`XCLVContentController`** - Main content script coordinator
- **`InteractiveContentAnalyzer`** - Click-to-analyze functionality with hover effects
- **`AnalysisPanel`** - Floating draggable analysis interface
- **`ContentExtractor`** - Smart content extraction from web pages
- **`BrandAnalysisService`** - AI-powered analysis engine
- **`PromptManager`** - Dynamic prompt loading system

### Analysis Framework

- **Tone-of-Voice**: Nielsen Norman Group Core Four Dimensions (Formal vs Casual, Serious vs Funny, etc.)
- **Brand Archetypes**: Jung's 12 classic archetypes with percentage distribution
- **Dual Analysis**: Parallel processing of both analysis types
- **Evidence-Based**: Quoted language examples with strategic justifications

## Development Commands

This is a pure Chrome Extension project with no build system. All files are directly loaded:

### Installation & Testing
```bash
# Load in Chrome for development
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select this directory

# Verify version (should show 1.2.34)
# Check console for: "XCLV: Content script v1.2.34 loaded successfully"
```

### Development Workflow
```bash
# No build step required - direct file editing
# Reload extension after changes:
# chrome://extensions/ -> Click reload button

# Check for errors:
# F12 Developer Tools -> Console tab
# Background service worker: chrome://extensions/ -> Extension details -> service worker
```

### Testing
```bash
# Manual testing workflow:
# 1. Enable interactive mode in popup
# 2. Hover over text elements (should highlight)
# 3. Click elements to select and show analyze button
# 4. Click "ANALYZE CONTENT" to run analysis
# 5. Verify results display in debug popup
```

## Key Development Guidelines

### Safe Loading Practices
- Always check class existence before declaration: `typeof window.ClassName === 'undefined'`
- Use loading flags to prevent duplicate execution: `window.xclvContentLoaded`
- Wrap initialization in comprehensive try-catch blocks
- Store classes on window object for persistence across reloads

### Version Management
- Update version in `manifest.json` for all releases
- Update console log versions in `content.js` and `background.js`
- Update README.md and CHANGELOG.md with changes
- Follow semantic versioning (Major.Minor.Patch)

### API Integration
- Google Gemini API keys are XOR encrypted with 'xclv2025' key
- Token limit optimized to 32,768 (50% of Flash's 65K capacity)
- Manual analysis control - analysis only runs on user click
- Comprehensive error handling with user-friendly messages

### Interactive Mode System
- Element highlighting on hover with blur effects
- Click-to-select with visual feedback (green outline)
- Smart button positioning with viewport boundary detection
- Multiple event detection methods for reliability

### Security & Privacy
- Content Security Policy compliance (no inline scripts)
- XOR encrypted API key storage with automatic migration
- Local-only processing, no data transmitted to XCLV servers
- Minimal permissions (activeTab, storage, scripting)

## Common Issues & Solutions

### Extension Won't Load
- Check for JavaScript console errors on load
- Verify version shows correctly in chrome://extensions/
- Look for "XCLV: Content script loaded successfully" message
- Ensure no class redeclaration errors

### Interactive Mode Not Working
- Verify "Enable Hover Analysis" checkbox is enabled in popup
- Check console for hover mode activation messages
- Try refreshing page after enabling mode
- Ensure elements have sufficient text content (5+ characters)

### Analysis Fails
- Verify Gemini API key is properly configured and saved
- Test API connection using "TEST" button in popup
- Check API quota and billing in Google AI Studio
- Review token limits for large content analysis

### Button Positioning Issues
- Extension uses 4-tier fallback positioning system
- Buttons automatically adjust for viewport boundaries
- Visual debugging available with red glow indicators
- Test across different screen sizes and zoom levels

## File Structure Notes

- **`prompts/`** - Dynamic system prompts for different analysis types
- **`icons/`** - Extension icons in various sizes
- **`debug-popup.html`** - Comprehensive debug interface
- **Documentation files**: README.md, CHANGELOG.md, TODO.md, etc.

## Extension Lifecycle

1. **Installation**: Extension loads with clean console output
2. **Activation**: User configures API key and enables interactive mode  
3. **Usage**: Click-to-analyze workflow with real-time feedback
4. **Analysis**: Manual trigger system with comprehensive results
5. **Results**: Professional overlay display with strategic insights

This extension represents a production-ready brand analysis tool with enterprise-grade reliability and comprehensive error handling.