// XCLV Debug Popup Controller
// Complete debugging interface for brand analysis workflow

class XCLVDebugController {
  constructor() {
    this.isLogging = false;
    this.logEntries = [];
    this.currentTab = null;
    this.lastExtraction = null;
    this.lastAnalysis = null;
  }

  async initialize() {
    this.setupEventListeners();
    this.setupTabs();
    await this.getCurrentTab();
    this.updateStatus('Ready for debugging');
    this.startAutoLogging();
  }

  setupEventListeners() {
    // Action buttons
    document.getElementById('extractContentBtn').addEventListener('click', () => this.extractContent());
    document.getElementById('testAnalysisBtn').addEventListener('click', () => this.testAnalysis());
    document.getElementById('clearLogsBtn').addEventListener('click', () => this.clearLogs());
    document.getElementById('startLoggingBtn').addEventListener('click', () => this.toggleLogging());
    document.getElementById('exportLogsBtn').addEventListener('click', () => this.exportLogs());
  }

  setupTabs() {
    document.querySelectorAll('.debug-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.debug-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update content panels
    document.querySelectorAll('.debug-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
  }

  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      this.log(`Connected to tab: ${tab.url}`);
    } catch (error) {
      this.log(`Failed to get current tab: ${error.message}`, 'error');
    }
  }

  async extractContent() {
    if (!this.currentTab) {
      this.updateStatus('No active tab', 'error');
      return;
    }

    this.updateStatus('Extracting content...', 'active');
    this.log('Starting content extraction...');

    try {
      // Execute content extraction in the active tab
      const results = await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        func: this.extractPageContent,
      });

      const extractionResult = results[0].result;
      this.lastExtraction = extractionResult;

      // Update UI with results
      this.displayExtractionResults(extractionResult);
      this.updateStatus('Content extracted', 'active');
      this.log(`Content extracted: ${extractionResult.content.length} characters`);

    } catch (error) {
      this.updateStatus('Extraction failed', 'error');
      this.log(`Content extraction failed: ${error.message}`, 'error');
      this.showError(`Content extraction failed: ${error.message}`);
    }
  }

  // This function runs in the page context
  extractPageContent() {
    const contentSelectors = [
      'main', 'article', '[role="main"]',
      '.content', '.main-content', '#content',
      'p', 'h1', 'h2', 'h3'
    ];

    let content = '';
    const elementCounts = {};
    const elementDetails = [];

    contentSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elementCounts[selector] = elements.length;

        elements.forEach((el, index) => {
          if (el && el.textContent && el.textContent.trim().length > 20) {
            const text = el.textContent.trim();
            
            // Check if it's likely UI noise
            const isUIElement = ['cookie', 'popup', 'modal', 'overlay', 'banner', 'navigation', 'menu', 'header', 'footer', 'sidebar']
              .some(indicator => 
                text.toLowerCase().includes(indicator) || 
                (el.className || '').toLowerCase().includes(indicator) ||
                (el.id || '').toLowerCase().includes(indicator)
              );

            if (!isUIElement) {
              content += text + ' ';
              elementDetails.push({
                selector,
                index,
                tag: el.tagName.toLowerCase(),
                id: el.id || '',
                className: el.className || '',
                textLength: text.length,
                textPreview: text.substring(0, 100) + (text.length > 100 ? '...' : '')
              });
            }
          }
        });
      } catch (error) {
        console.warn(`Failed to process selector ${selector}:`, error);
      }
    });

    content = content.trim();

    // Extract metadata
    const metadata = {
      title: document.title || '',
      description: document.querySelector('meta[name="description"]')?.content || '',
      keywords: document.querySelector('meta[name="keywords"]')?.content || '',
      url: window.location.href,
      domain: window.location.hostname,
      timestamp: new Date().toISOString()
    };

    // Extract headlines
    const headlines = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(el => ({
        level: el.tagName.toLowerCase(),
        text: el.textContent.trim(),
        length: el.textContent.trim().length
      }))
      .filter(h => h.text.length > 0);

    // Extract CTAs
    const ctas = Array.from(document.querySelectorAll('button, a[href], .btn, .button, .cta, [role="button"]'))
      .map(el => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent.trim(),
        href: el.href || '',
        type: el.type || ''
      }))
      .filter(cta => cta.text.length > 0 && cta.text.length < 100)
      .slice(0, 20); // Limit to first 20 CTAs

    return {
      content,
      metadata,
      elementCounts,
      elementDetails: elementDetails.slice(0, 50), // Limit details
      headlines,
      ctas,
      stats: {
        totalLength: content.length,
        wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
        elementCount: elementDetails.length,
        headlineCount: headlines.length,
        ctaCount: ctas.length
      }
    };
  }

  displayExtractionResults(result) {
    // Update timestamp
    document.getElementById('extractionTimestamp').textContent = 
      `Extracted at ${new Date().toLocaleTimeString()}`;

    // Update metrics
    document.getElementById('contentLength').textContent = result.stats.totalLength;
    document.getElementById('contentWords').textContent = result.stats.wordCount;
    document.getElementById('contentElements').textContent = result.stats.elementCount;

    // Update content display
    document.getElementById('extractedContent').textContent = result.content;

    // Update metadata
    document.getElementById('contentMetadata').textContent = 
      JSON.stringify(result.metadata, null, 2);

    // Update element analysis
    const elementAnalysis = {
      elementCounts: result.elementCounts,
      headlines: result.headlines,
      ctas: result.ctas.slice(0, 10), // Show first 10 CTAs
      topElements: result.elementDetails.slice(0, 20) // Show first 20 elements
    };
    document.getElementById('elementAnalysis').textContent = 
      JSON.stringify(elementAnalysis, null, 2);
  }

  async testAnalysis() {
    if (!this.lastExtraction) {
      this.showError('Please extract content first');
      return;
    }

    if (!this.lastExtraction.content || this.lastExtraction.content.length < 50) {
      this.showError('Insufficient content for analysis (less than 50 characters)');
      return;
    }

    this.updateStatus('Testing AI analysis...', 'active');
    this.log('Starting AI analysis test...');

    try {
      // Get API configuration
      const { geminiApiKey, selectedModel } = await this.getAPISettings();
      
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      // Build prompts
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(this.lastExtraction.content);
      const fullPrompt = `${systemPrompt}\n\nUser Request: ${userPrompt}`;

      // Display prompts
      document.getElementById('systemPrompt').textContent = systemPrompt;
      document.getElementById('userPrompt').textContent = userPrompt;

      // Build API request
      const apiRequest = {
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      };

      document.getElementById('apiRequest').textContent = 
        JSON.stringify(apiRequest, null, 2);

      this.log('Sending request to Gemini 2.5...');

      // Make API call
      const model = selectedModel || 'gemini-2.5-flash';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequest)
      });

      const responseData = await response.json();

      // Display raw response
      document.getElementById('responseTimestamp').textContent = 
        `Response received at ${new Date().toLocaleTimeString()}`;
      document.getElementById('rawResponse').textContent = 
        JSON.stringify(responseData, null, 2);

      if (response.ok && responseData.candidates && responseData.candidates[0]) {
        const aiResponse = responseData.candidates[0].content.parts[0].text;
        this.log('AI response received successfully');

        // Try to parse as JSON
        try {
          const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsedResponse = JSON.parse(cleanedResponse);
          
          document.getElementById('parsedResponse').textContent = 
            JSON.stringify(parsedResponse, null, 2);
          document.getElementById('responseErrors').innerHTML = 
            '<div class="success-message">✅ Response parsed successfully</div>';
          
          this.updateStatus('Analysis complete', 'active');
          this.log('Analysis completed successfully');

        } catch (parseError) {
          document.getElementById('responseErrors').innerHTML = 
            `<div class="error-message">❌ JSON Parse Error: ${parseError.message}<br><br>Raw AI Response:<br>${aiResponse}</div>`;
          this.log(`JSON parse error: ${parseError.message}`, 'error');
          this.updateStatus('Parse error', 'error');
        }

      } else {
        const errorMsg = responseData.error?.message || `HTTP ${response.status}`;
        throw new Error(errorMsg);
      }

    } catch (error) {
      this.log(`Analysis failed: ${error.message}`, 'error');
      this.updateStatus('Analysis failed', 'error');
      this.showError(`Analysis failed: ${error.message}`);
      
      document.getElementById('responseErrors').innerHTML = 
        `<div class="error-message">❌ ${error.message}</div>`;
    }
  }

  buildSystemPrompt() {
    return `You are a strategic brand analysis expert with 20+ years of experience, powered by Gemini 2.5 AI.

Analyze web content for:
- Tone of voice (professional, casual, authoritative, friendly, etc.)
- Brand archetype alignment (Hero, Sage, Explorer, Innocent, Ruler, etc.)
- Message clarity and coherence
- Emotional resonance and engagement
- Brand consistency across touchpoints

Always return structured JSON responses with actionable insights.
Be bold in your assessments - brands need honest feedback to evolve.
Consider current market trends and cultural context in your analysis.`;
  }

  buildUserPrompt(content) {
    return `Analyze the tone of voice in this content using your advanced understanding.

Content to analyze:
"""
${content.substring(0, 3000)}${content.length > 3000 ? '\n\n[Content truncated...]' : ''}
"""

Return JSON with this exact structure:
{
  "scores": {
    "formality": 0-100,
    "warmth": 0-100, 
    "authority": 0-100,
    "authenticity": 0-100,
    "innovation": 0-100
  },
  "dominantTone": "string description",
  "recommendations": [
    {
      "area": "specific aspect to improve",
      "insight": "what to change and why"
    }
  ],
  "brandPersonality": "one-sentence brand personality assessment"
}`;
  }

  async getAPISettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['geminiApiKey', 'selectedModel'], (result) => {
        resolve({
          geminiApiKey: result.geminiApiKey || '',
          selectedModel: result.selectedModel || 'gemini-2.5-flash'
        });
      });
    });
  }

  updateStatus(message, type = 'waiting') {
    const statusEl = document.getElementById('debugStatus');
    statusEl.textContent = message;
    statusEl.className = `debug-status status-${type}`;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    this.logEntries.push(logEntry);

    // Update live log display
    const logEl = document.getElementById('liveLog');
    const logLine = `[${timestamp}] ${type.toUpperCase()}: ${message}\n`;
    logEl.textContent = logLine + logEl.textContent;

    // Limit log entries
    if (this.logEntries.length > 1000) {
      this.logEntries = this.logEntries.slice(-500);
    }
  }

  showError(message) {
    // Find a good place to show the error
    const errorContainer = document.querySelector('.debug-panel.active .debug-section-content');
    if (errorContainer) {
      const errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      errorEl.textContent = `❌ ${message}`;
      errorContainer.insertBefore(errorEl, errorContainer.firstChild);

      // Remove after 5 seconds
      setTimeout(() => {
        if (errorEl.parentNode) {
          errorEl.parentNode.removeChild(errorEl);
        }
      }, 5000);
    }
  }

  clearLogs() {
    this.logEntries = [];
    document.getElementById('liveLog').textContent = 'Logs cleared...\n';
    this.log('Debug logs cleared');
  }

  toggleLogging() {
    this.isLogging = !this.isLogging;
    const btn = document.getElementById('startLoggingBtn');
    btn.textContent = this.isLogging ? 'Stop Logging' : 'Start Live Logging';
    btn.className = this.isLogging ? 'debug-btn secondary' : 'debug-btn';
    
    this.log(`Live logging ${this.isLogging ? 'started' : 'stopped'}`);
  }

  startAutoLogging() {
    // Monitor for extension messages and API calls
    if (chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (this.isLogging) {
          this.log(`Extension message: ${JSON.stringify(message)}`);
        }
      });
    }
  }

  exportLogs() {
    const exportData = {
      timestamp: new Date().toISOString(),
      url: this.currentTab?.url || 'unknown',
      extraction: this.lastExtraction,
      logs: this.logEntries
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: `xclv-debug-${Date.now()}.json`,
      saveAs: true
    });

    this.log('Debug logs exported');
  }
}

// Helper function for collapsible sections
function toggleSection(header) {
  const section = header.parentElement;
  const indicator = header.querySelector('.collapse-indicator');
  
  section.classList.toggle('collapsed');
  
  if (section.classList.contains('collapsed')) {
    indicator.textContent = '▶';
  } else {
    indicator.textContent = '▼';
  }
}

// Initialize debug controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const debugController = new XCLVDebugController();
  debugController.initialize();
  
  // Make it globally accessible for debugging
  window.xclvDebug = debugController;
});
