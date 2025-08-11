# XCLV Brand Analysis Extension

**Strategic Brand Intelligence powered by Gemini 2.5 AI**

Transform your brand analysis workflow with real-time insights into tone of voice, brand archetypes, and message clarity for any webpage. Built for the LiveBranding approach - treating brands as dynamic, evolving systems.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green)](https://chrome.google.com/webstore) [![Gemini 2.5](https://img.shields.io/badge/Powered%20by-Gemini%202.5-blue)](https://ai.google.dev/) [![LiveBranding](https://img.shields.io/badge/Methodology-LiveBranding-orange)](https://xclv.ai) [![Version](https://img.shields.io/badge/Version-1.2.4-brightgreen)](https://github.com/xclv-ai/xclv_analysis/releases)

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

### 🔧 Latest Fixes (v1.2.4)
- **✅ Fixed API Key Saving**: Properly validates and stores Gemini API keys
- **✅ Fixed Button Functionality**: All popup buttons now work correctly
- **✅ Enhanced Error Handling**: Better feedback for all operations
- **✅ Improved Validation**: API key length and format validation
- **✅ Background Service Integration**: Proper communication between components

### Smart Content Intelligence
- **Hover Insights**: Get instant clarity scores on any text element
- **Live Scoreboard**: Monitor brand performance metrics in real-time
- **Competitive Analysis**: Compare brand positioning against industry standards
- **Export Reports**: Generate comprehensive brand analysis reports

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
4. **Click "Start Analysis"** to begin real-time analysis
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

- **Hover Analysis**: Enable "Hover Insights" to get instant text clarity scores
- **Live Metrics**: Toggle "Live Scoreboard" for continuous brand monitoring
- **Export Data**: Click "Export Report" to save analysis as JSON
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

Access advanced settings through:
- **Popup Interface**: Basic controls and real-time toggles
- **Options Page**: Detailed configuration and preferences
- **Right-click Extension**: Quick access to settings

## 🔧 Troubleshooting

### Common Issues & Solutions

**🔴 API Key Won't Save (FIXED in v1.2.4):**
- ✅ Now validates key length (minimum 20 characters)
- ✅ Provides clear error messages
- ✅ Properly communicates with background service
- ✅ Persists settings between sessions

**🔴 Buttons Not Working (FIXED in v1.2.4):**
- ✅ All event listeners properly bound
- ✅ Fixed JavaScript syntax errors
- ✅ Enhanced error handling and feedback
- ✅ Improved popup initialization

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
├── manifest.json          # Extension configuration (v1.2.4)
├── background.js          # AI services and background logic
├── content.js            # Page interaction and analysis UI
├── popup.html/js         # Extension popup interface (FIXED)
├── options.html/js       # Settings and configuration
├── content-styles.css    # Analysis panel styling
├── CHANGELOG.md          # Version history and fixes
└── icons/               # Extension icons
```

### Key Classes

- **XCLVPopupController**: FIXED - Handles popup interface and API configuration
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
    "timestamp": "2025-08-11T10:47:02Z",
    "model": "gemini-2.5-flash",
    "version": "1.2.4"
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

- **Syntax Validation**: All JavaScript must pass ESLint validation
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

### Phase 3: Stability & Performance (✅ v1.2.4)
- [x] Fixed API key saving functionality
- [x] Resolved button interaction issues
- [x] Enhanced error handling and validation
- [x] Improved popup reliability
- [x] Better user feedback systems

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

## 🆕 What's New in v1.2.4

### 🔧 Critical Fixes
- **✅ API Key Saving**: Fixed validation and storage persistence
- **✅ Button Functionality**: All popup buttons now work correctly
- **✅ JavaScript Errors**: Resolved syntax issues breaking popup
- **✅ Error Handling**: Enhanced feedback for all operations
- **✅ Background Service**: Improved communication between components

### 🛡️ Stability Improvements
- **Robust Validation**: API key length and format checks
- **Better Testing**: Enhanced API connection verification
- **Persistent Settings**: Settings now properly save between sessions
- **Error Recovery**: Graceful handling of API and connection failures
- **User Feedback**: Clear success/error messages for all actions

### 🔧 Technical Enhancements
- **Code Quality**: Fixed JavaScript syntax errors and escaping issues
- **Event Handling**: Properly bound all button event listeners
- **Storage Management**: Improved Chrome storage API integration
- **Version Control**: Updated to v1.2.4 with proper manifest versioning

**Transform your brand analysis workflow. Start building adaptive brand intelligence today.** 🚀

*Built with ❤️ for the LiveBranding revolution by [XCLV](https://xclv.ai)*
