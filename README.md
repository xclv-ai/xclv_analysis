# XCLV Brand Analysis Extension

**Strategic Brand Intelligence powered by Gemini 2.5 AI**

Transform your brand analysis workflow with real-time insights into tone of voice, brand archetypes, and message clarity for any webpage. Built for the LiveBranding approach - treating brands as dynamic, evolving systems.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green)](https://chrome.google.com/webstore) [![Gemini 2.5](https://img.shields.io/badge/Powered%20by-Gemini%202.5-blue)](https://ai.google.dev/) [![LiveBranding](https://img.shields.io/badge/Methodology-LiveBranding-orange)](https://xclv.ai) [![Version](https://img.shields.io/badge/Version-1.2.7-brightgreen)](https://github.com/xclv-ai/xclv_analysis/releases)

## 🚀 Features

### Real-Time Brand Analysis
- **Tone of Voice Detection**: Analyze formality, warmth, authority, authenticity, and innovation
- **Brand Archetype Identification**: Map content to 12 core brand archetypes (Hero, Sage, Explorer, etc.)
- **Message Clarity Scoring**: Real-time assessment of communication effectiveness
- **Cultural Alignment**: Understand how brand positioning fits current market trends

### 🎯 Interactive Mouseover Analysis (v1.2.0+)
- **Smart Text Detection**: Hover over any text element to see animated analysis frames
- **One-Click Analysis**: Click "Analyze Content" button for instant brand intelligence
- **Debug Popup**: Comprehensive debugging interface showing:
  - Parsed content sent to Gemini
  - Complete system prompts
  - Raw LLM outputs and responses
  - Element context and styling data
- **Real-Time Insights**: Get immediate clarity scores and brand recommendations

### 🎨 Professional UI (v1.2.7+)
- **✅ Complete CSS Design**: Modern professional interface with XCLV brand colors
- **✅ Fixed UI Issues**: All popup styling now works correctly
- **✅ Working Analysis Panel**: Show Analysis Panel button now functions properly
- **✅ Streamlined Settings**: Simplified to essential hover insights only
- **✅ Responsive Design**: Mobile-friendly popup with smooth animations
- **✅ Accessibility Support**: High contrast and reduced motion options

### 🔧 Latest Fixes (v1.2.7)
- **✅ Fixed Missing CSS**: Added complete popup.css file that was causing broken UI
- **✅ Fixed Show Panel**: Analysis panel now creates and displays correctly
- **✅ Removed Excluded Settings**: Real-time Analysis and Live Scoreboard settings removed
- **✅ Enhanced Error Handling**: Better feedback for all operations
- **✅ Improved Button States**: Loading animations and proper visual feedback

### Smart Content Intelligence
- **Hover Insights**: Get instant clarity scores on any text element
- **Competitive Analysis**: Compare brand positioning against industry standards
- **Export Reports**: Generate comprehensive brand analysis reports
- **Advanced Debugging**: Professional development tools with multi-tab interface

### Advanced AI Integration
- **Gemini 2.5 Powered**: Leverages Google's latest AI for sophisticated brand understanding
- **Adaptive Learning**: Continuously improves analysis based on brand evolution patterns
- **Multi-Model Support**: Choose between Flash, Flash-Lite, and Pro models based on needs

## 📦 Installation

### Quick Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/xclv-ai/xclv_analysis.git
   cd xclv_analysis
   ```

2. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top-right toggle)
   - Click "Load unpacked"
   - Select the `xclv_analysis` directory

3. **Configure API:**
   - Click the XCLV extension icon
   - Add your [Gemini 2.5 API key](https://aistudio.google.com/app/apikey)
   - Select your preferred model
   - Click "SAVE" then "TEST" to verify connection

### Verification

Run the verification script to ensure everything is working:
```bash
node verify-extension.js
```

## 🎯 Usage

### Basic Analysis

1. **Navigate to any webpage** with brand content
2. **Click the XCLV extension icon** in your browser toolbar
3. **Configure your Gemini API key** (one-time setup)
4. **Click "Analyze Page"** to begin real-time analysis
5. **View results** in the floating analysis panel

### 🆕 Interactive Mouseover Analysis

1. **Enable Interactive Mode** in the popup interface
2. **Hover over any text element** on the page
3. **See animated frames** highlighting analyzable content
4. **Click "Analyze Content"** button to get detailed insights
5. **View debug popup** with:
   - Complete extracted text and context
   - System prompt sent to Gemini
   - Full LLM analysis output
   - Raw API response data

### Advanced Features

- **Show Analysis Panel**: Click to display floating brand analysis interface
- **Hover Analysis**: Enable for instant text clarity scores on mouseover
- **Export Data**: Click "Export Report" to save analysis as Markdown
- **Debug Console**: Open advanced debugging tools for development

### Keyboard Shortcuts

- `Ctrl+Shift+B` / `Cmd+Shift+B`: Toggle brand analysis
- `Ctrl+Shift+P` / `Cmd+Shift+P`: Show/hide analysis panel
- `Ctrl+Shift+I` / `Cmd+Shift+I`: Toggle interactive mouseover mode
- `Ctrl+Shift+D` / `Cmd+Shift+D`: Open debug console
- `Ctrl+Shift+E` / `Cmd+Shift+E`: Export current report
- `Escape`: Close popup

## 🛠 Configuration

### API Models

Choose the right Gemini 2.5 model for your needs:

| Model | Speed | Accuracy | Cost | Best For |
|-------|--------|----------|------|----------|
| **Flash** | ⚡⚡⚡ | ⭐⭐⭐ | $ | Real-time analysis |
| **Flash-Lite** | ⚡⚡⚡⚡ | ⭐⭐ | $ | High-volume scanning |
| **Pro** | ⚡⚡ | ⭐⭐⭐⭐ | $$$ | Deep strategic analysis |

### Settings

Access settings through the collapsible popup interface:
- **Popup Interface**: Clean, modern controls with collapsible API section
- **Hover Insights**: Toggle real-time text analysis on mouseover
- **Options Page**: Detailed configuration and preferences
- **Right-click Extension**: Quick access to settings

## 🔧 Troubleshooting

### Common Issues & Solutions

**🔴 UI Appears Broken or Unstyled (FIXED in v1.2.7):**
- ✅ Now includes complete popup.css file
- ✅ Professional XCLV-branded interface
- ✅ Responsive design with proper spacing
- ✅ All visual elements display correctly

**🔴 Show Analysis Panel Not Working (FIXED in v1.2.7):**
- ✅ Completely rebuilt panel functionality
- ✅ Better script injection with fallbacks
- ✅ Creates panel even if content script fails
- ✅ Clear success/error feedback

**🔴 Settings Not Available (FIXED in v1.2.7):**
- ✅ Removed Real-time Analysis checkbox
- ✅ Removed Live Scoreboard checkbox
- ✅ Simplified to essential Hover Insights only
- ✅ Clean, focused settings interface

**Extension won't load:**
- Verify all files are present using `node verify-extension.js`
- Check Chrome DevTools console for errors
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed fixes

**Analysis shows "unavailable":**
- Verify Gemini 2.5 API key is configured correctly
- Check API quota and billing status
- Test API connection using the "TEST" button

**Interactive mode not working:**
- Ensure Interactive Mode is enabled in popup
- Check browser console for JavaScript errors
- Try refreshing the page after enabling
- Verify content script is loaded properly

**Content not being analyzed:**
- Ensure page has sufficient text content (20+ characters per element)
- Check that content isn't hidden behind overlays/modals
- Try on a different page with clear brand messaging
- Use debug console to test analysis functions

### Debug Mode

For advanced debugging, use the debug console:
```javascript
// Open browser console (F12) and use:
xclvDebugConsole.extractContent();  // Extract page content
xclvDebugConsole.getAnalysisData();  // Get current analysis
xclvDebugConsole.testAnalysis('test text');  // Test analysis function
```

## 🏗 Architecture

### Extension Components

```
xclv_analysis/
├── manifest.json          # Extension configuration (v1.2.7)
├── background.js          # AI services and background logic
├── content.js            # Page interaction and analysis UI
├── popup.html/js/css     # Extension popup interface (FIXED)
├── options.html/js       # Settings and configuration
├── content-styles.css    # Analysis panel styling
├── CHANGELOG.md          # Version history and fixes
└── icons/               # Extension icons
```

### Key Classes

- **XCLVPopupController**: FIXED - Professional popup interface with working functionality
- **BrandAnalysisService**: Core AI-powered analysis engine
- **ToneAnalysisEngine**: Sophisticated tone detection algorithms
- **ArchetypeAnalyzer**: Brand personality identification
- **WebContentExtractor**: Smart content extraction with noise filtering
- **BrandAnalysisUI**: Real-time analysis interface
- **InteractiveContentAnalyzer**: Mouseover analysis and debug popup

## 📊 Output Format

### Analysis Structure

```json
{
  "tone": {
    "scores": {
      "formality": 75,
      "warmth": 82,
      "authority": 68,
      "authenticity": 91,
      "innovation": 77
    },
    "dominantTone": "warm, authentic, moderately formal",
    "brandPersonality": "Trusted friend who genuinely cares",
    "recommendations": [...],
    "culturalAlignment": "Strong fit with current transparency trends"
  },
  "archetypes": {
    "primaryArchetype": {
      "name": "Caregiver",
      "score": 87,
      "evidence": ["caring language", "support focus", "family values"]
    },
    "secondaryArchetype": {...},
    "recommendations": [...],
    "brandEvolution": "Expand from protection to empowerment"
  },
  "metadata": {
    "url": "https://example.com",
    "timestamp": "2025-08-11T12:25:00Z",
    "model": "gemini-2.5-flash",
    "version": "1.2.7"
  }
}
```

## 🎨 LiveBranding Philosophy

This extension embodies the **LiveBranding methodology**:

- **Dynamic Analysis**: Brands as evolving systems, not static guidelines
- **Cultural Context**: Real-time assessment of market relevance
- **Adaptive Intelligence**: AI that learns from brand evolution patterns
- **Actionable Insights**: Strategic recommendations for brand development
- **Interactive Debugging**: Deep visibility into AI decision-making processes

### Strategic Applications

- **Brand Audits**: Comprehensive analysis of digital touchpoints
- **Competitive Intelligence**: Real-time monitoring of market positioning
- **Content Optimization**: Improve messaging clarity and effectiveness
- **Cultural Alignment**: Ensure brand relevance in changing markets
- **Team Training**: Use debug features to understand brand analysis methodology

## 🤝 Contributing

We welcome contributions that advance the LiveBranding revolution:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/brand-insight`
3. **Implement with tests**: Ensure robust analysis capabilities
4. **Submit pull request**: Include LiveBranding impact assessment

### Development Priorities

- Enhanced archetype detection algorithms
- Real-time competitive analysis features
- Cultural trend integration
- Multi-language brand analysis support
- Advanced debugging and visualization tools

### Code Quality Standards

- **UI/UX Testing**: All popup changes must be visually verified
- **CSS Organization**: Use popup.css with proper variable system
- **Responsive Design**: Test on multiple screen sizes
- **Accessibility**: Ensure high contrast and reduced motion support
- **Error Handling**: Comprehensive try-catch blocks and user feedback
- **Version Control**: Always increment version numbers for updates
- **Testing**: Manual testing required for all popup functionality
- **Documentation**: Update README.md and CHANGELOG.md for all changes

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🔗 Links

- **Homepage**: [xclv.ai](https://xclv.ai)
- **Documentation**: [docs.xclv.ai](https://docs.xclv.ai/brand-analysis-extension)
- **Gemini API**: [Google AI Studio](https://aistudio.google.com)
- **Support**: [GitHub Issues](https://github.com/xclv-ai/xclv_analysis/issues)

## 📈 Roadmap

### Phase 1: Core Analysis (✅ Complete)
- [x] Tone of voice detection
- [x] Brand archetype analysis  
- [x] Real-time content scoring
- [x] Gemini 2.5 integration

### Phase 2: Interactive Intelligence (✅ v1.2.0)
- [x] Mouseover content analysis
- [x] Debug popup interface
- [x] Real-time element highlighting
- [x] Advanced debugging tools
- [x] Interactive mode controls

### Phase 3: Professional UI (✅ v1.2.7)
- [x] Complete CSS design system
- [x] Fixed broken UI elements
- [x] Working analysis panel
- [x] Streamlined settings interface
- [x] Responsive design with accessibility
- [x] Professional visual branding

### Phase 4: Advanced Intelligence (🚧 In Progress)
- [ ] Competitive analysis dashboard
- [ ] Cultural trend integration
- [ ] Multi-page brand consistency analysis
- [ ] Historical brand evolution tracking
- [ ] Team collaboration features

### Phase 5: Strategic Platform (📋 Planned)
- [ ] Brand guideline generation
- [ ] Performance analytics integration
- [ ] API for external brand tools
- [ ] Enterprise team management

---

## 🆕 What's New in v1.2.7

### 🔧 Critical UI Fixes
- **✅ Added Missing CSS**: Complete popup.css file with professional XCLV branding
- **✅ Fixed Show Panel**: Analysis panel now creates and displays correctly
- **✅ Removed Excluded Settings**: Real-time Analysis and Live Scoreboard checkboxes removed
- **✅ Streamlined Interface**: Clean, focused settings with only essential options

### 🎨 Professional Design System
- **Modern Brand Colors**: XCLV blue gradients with professional color palette
- **Smooth Animations**: Hover effects, loading states, and smooth transitions
- **Responsive Layout**: Mobile-friendly design with proper spacing
- **Accessibility Features**: High contrast support and reduced motion options
- **Interactive Feedback**: Clear notifications and button state changes

### 🛡️ Enhanced Reliability
- **Better Error Handling**: Comprehensive user feedback for all operations
- **Improved Script Injection**: More reliable content script loading
- **Fallback Systems**: Graceful degradation when content scripts fail
- **Performance Optimization**: Reduced memory usage and faster load times

**Transform your brand analysis workflow. Start building adaptive brand intelligence today.** 🚀

*Built with ❤️ for the LiveBranding revolution by [XCLV](https://xclv.ai)*
