# XCLV Brand Analysis Extension

**Strategic Brand Intelligence powered by Gemini 2.5 AI**

Transform your brand analysis workflow with real-time insights into tone of voice, brand archetypes, and message clarity for any webpage. Built for the LiveBranding approach - treating brands as dynamic, evolving systems.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green)](https://chrome.google.com/webstore) [![Gemini 2.5](https://img.shields.io/badge/Powered%20by-Gemini%202.5-blue)](https://ai.google.dev/) [![LiveBranding](https://img.shields.io/badge/Methodology-LiveBranding-orange)](https://xclv.ai)

## 🚀 Features

### Real-Time Brand Analysis
- **Tone of Voice Detection**: Analyze formality, warmth, authority, authenticity, and innovation
- **Brand Archetype Identification**: Map content to 12 core brand archetypes (Hero, Sage, Explorer, etc.)
- **Message Clarity Scoring**: Real-time assessment of communication effectiveness
- **Cultural Alignment**: Understand how brand positioning fits current market trends

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
   - Click "TEST" to verify connection

### Verification

Run the verification script to ensure everything is working:
```bash
node verify-extension.js
```

## 🎯 Usage

### Basic Analysis

1. **Navigate to any webpage** with brand content
2. **Click the XCLV extension icon** in your browser toolbar
3. **Click "Start Brand Analysis"** to begin real-time analysis
4. **View results** in the floating analysis panel

### Advanced Features

- **Hover Analysis**: Enable "Hover Insights" to get instant text clarity scores
- **Live Metrics**: Toggle "Live Scoreboard" for continuous brand monitoring
- **Export Data**: Click "Export Report" to save analysis as JSON

### Keyboard Shortcuts

- `Alt + A`: Toggle brand analysis
- `Alt + P`: Show/hide analysis panel
- `Alt + E`: Export current report
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

### Common Issues

**Extension won't load:**
- Verify all files are present using `node verify-extension.js`
- Check Chrome DevTools console for errors
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed fixes

**Analysis shows "unavailable":**
- Verify Gemini 2.5 API key is configured correctly
- Check API quota and billing status
- Test API connection using the "TEST" button

**Content not being analyzed:**
- Ensure page has sufficient text content (50+ characters)
- Check that content isn't hidden behind overlays/modals
- Try on a different page with clear brand messaging

### Debug Mode

For advanced debugging, use the debug console:
```javascript
// Paste into browser console on any page
// Copy content from debug-console.js
```

## 🏗 Architecture

### Extension Components

```
xclv_analysis/
├── manifest.json          # Extension configuration
├── background.js          # AI services and background logic
├── content.js            # Page interaction and analysis UI
├── popup.html/js         # Extension popup interface
├── options.html/js       # Settings and configuration
├── content-styles.css    # Analysis panel styling
└── icons/               # Extension icons
```

### Key Classes

- **BrandAnalysisService**: Core AI-powered analysis engine
- **ToneAnalysisEngine**: Sophisticated tone detection algorithms
- **ArchetypeAnalyzer**: Brand personality identification
- **WebContentExtractor**: Smart content extraction with noise filtering
- **BrandAnalysisUI**: Real-time analysis interface

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
    "timestamp": "2025-08-11T09:53:43Z",
    "model": "gemini-2.5-flash",
    "version": "2.5"
  }
}
```

## 🎨 LiveBranding Philosophy

This extension embodies the **LiveBranding methodology**:

- **Dynamic Analysis**: Brands as evolving systems, not static guidelines
- **Cultural Context**: Real-time assessment of market relevance
- **Adaptive Intelligence**: AI that learns from brand evolution patterns
- **Actionable Insights**: Strategic recommendations for brand development

### Strategic Applications

- **Brand Audits**: Comprehensive analysis of digital touchpoints
- **Competitive Intelligence**: Real-time monitoring of market positioning
- **Content Optimization**: Improve messaging clarity and effectiveness
- **Cultural Alignment**: Ensure brand relevance in changing markets

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

### Phase 2: Advanced Intelligence (🚧 In Progress)
- [ ] Competitive analysis dashboard
- [ ] Cultural trend integration
- [ ] Multi-page brand consistency analysis
- [ ] Historical brand evolution tracking

### Phase 3: Strategic Platform (📋 Planned)
- [ ] Team collaboration features
- [ ] Brand guideline generation
- [ ] Performance analytics integration
- [ ] API for external brand tools

---

**Transform your brand analysis workflow. Start building adaptive brand intelligence today.** 🚀

*Built with ❤️ for the LiveBranding revolution by [XCLV](https://xclv.ai)*
