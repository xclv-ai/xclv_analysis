// XCLV Brand Analysis - Fixed Popup Interface
// Professional UI with working analysis panel and proper settings
// KEEPING GEMINI 2.5 MODEL AS DEFAULT

class XCLVPopupController {
  constructor() {
    this.isInitialized = false;
    this.settings = {
      hoverInsights: true
    };
    this.analysisData = null;
    this.isAnalyzing = false;
  }

  async initialize() {
    try {
      if (this.isInitialized) return;

      // Load saved settings
      await this.loadSettings();
      
      // Setup UI event handlers
      this.setupEventHandlers();
      
      // Initialize API section as collapsed
      this.initializeCollapsibleSections();
      
      // Check extension status
      await this.checkExtensionStatus();
      
      this.isInitialized = true;
      console.log('XCLV Popup: Initialized successfully');
    } catch (error) {
      console.error('XCLV Popup: Failed to initialize:', error);
      this.showNotification('Failed to initialize extension', 'error');
    }
  }

  initializeCollapsibleSections() {
    try {
      // Set API section to collapsed by default
      const apiSection = document.getElementById('api-settings-section');
      const apiContent = document.getElementById('api-settings-content');
      const apiToggle = document.getElementById('api-toggle-btn');

      if (apiSection && apiContent && apiToggle) {
        // Start collapsed
        apiContent.style.display = 'none';
        apiToggle.textContent = '⚙️ API Settings';
        apiSection.classList.add('collapsed');

        // Add click handler for toggle
        apiToggle.addEventListener('click', () => {
          this.toggleApiSection();
        });
      }

      // Initialize other collapsible sections
      this.initializeOtherSections();
    } catch (error) {
      console.error('XCLV Popup: Failed to initialize collapsible sections:', error);
    }
  }

  toggleApiSection() {
    try {
      const apiContent = document.getElementById('api-settings-content');
      const apiToggle = document.getElementById('api-toggle-btn');
      const apiSection = document.getElementById('api-settings-section');

      if (!apiContent || !apiToggle || !apiSection) return;

      const isExpanded = apiContent.style.display !== 'none';

      if (isExpanded) {
        // Collapse
        apiContent.style.display = 'none';
        apiToggle.textContent = '⚙️ API Settings';
        apiSection.classList.add('collapsed');
      } else {
        // Expand
        apiContent.style.display = 'block';
        apiToggle.textContent = '▼ API Settings';
        apiSection.classList.remove('collapsed');
      }
    } catch (error) {
      console.error('XCLV Popup: Failed to toggle API section:', error);
    }
  }

  initializeOtherSections() {
    // Add any other collapsible sections here
  }

  setupEventHandlers() {
    try {
      // Analysis buttons
      this.setupButton('analyze-page-btn', () => this.startPageAnalysis());
      this.setupButton('show-panel-btn', () => this.showAnalysisPanel());
      this.setupButton('stop-analysis-btn', () => this.stopAnalysis());

      // Interactive mode
      this.setupButton('enable-interactive-btn', () => this.enableInteractiveMode());
      this.setupButton('disable-interactive-btn', () => this.disableInteractiveMode());

      // API settings
      this.setupButton('save-api-btn', () => this.saveApiSettings());
      this.setupButton('test-api-btn', () => this.testApiConnection());

      // Settings toggles - only hover insights now
      this.setupToggle('hover-insights', 'hoverInsights');

      // Export functionality
      this.setupButton('export-report-btn', () => this.exportReport());

    } catch (error) {
      console.error('XCLV Popup: Failed to setup event handlers:', error);
    }
  }

  setupButton(id, handler) {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await handler();
        } catch (error) {
          console.error(`XCLV Popup: Error in ${id}:`, error);
          this.showNotification(`Error: ${error.message}`, 'error');
        }
      });
    } else {
      console.warn(`XCLV Popup: Button ${id} not found`);
    }
  }

  setupToggle(id, settingKey) {
    const toggle = document.getElementById(id);
    if (toggle) {
      toggle.checked = this.settings[settingKey];
      toggle.addEventListener('change', (e) => {
        this.settings[settingKey] = e.target.checked;
        this.saveSettings();
      });
    }
  }

  async startPageAnalysis() {
    try {
      this.isAnalyzing = true;
      this.updateAnalysisUI(true);
      this.showNotification('Starting page analysis...', 'info');

      const tabs = await this.getCurrentTab();
      if (!tabs || tabs.length === 0) {
        throw new Error('No active tab found');
      }

      const response = await this.sendMessageToTab(tabs[0].id, {
        action: 'startAnalysis'
      });

      if (response && response.success) {
        this.analysisData = response.data;
        this.showNotification('Analysis completed successfully!', 'success');
        this.displayAnalysisResults(response.data);
      } else {
        throw new Error(response?.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('XCLV Popup: Page analysis failed:', error);
      this.showNotification(`Analysis failed: ${error.message}`, 'error');
    } finally {
      this.isAnalyzing = false;
      this.updateAnalysisUI(false);
    }
  }

  async showAnalysisPanel() {
    try {
      this.showNotification('Opening analysis panel...', 'info');
      
      const tabs = await this.getCurrentTab();
      if (!tabs || tabs.length === 0) {
        throw new Error('No active tab found');
      }

      // First try to inject content script if needed
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        });
      } catch (e) {
        // Content script might already be injected, that's fine
        console.log('Content script already present or injection failed:', e.message);
      }

      // Send message to show panel
      const response = await this.sendMessageToTab(tabs[0].id, {
        action: 'showPanel'
      });

      if (response && response.success) {
        this.showNotification('Analysis panel opened successfully!', 'success');
      } else {
        // Try alternative approach - inject and show panel directly
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
              // Create and show analysis panel directly
              if (window.xclvBrandAnalyzer) {
                window.xclvBrandAnalyzer.showAnalysisPanel();
                return { success: true };
              } else {
                // Create basic panel if analyzer not present
                const panel = document.createElement('div');
                panel.id = 'xclv-analysis-panel';
                panel.style.cssText = `
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  width: 350px;
                  height: 500px;
                  background: white;
                  border: 2px solid #2563eb;
                  border-radius: 12px;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                  z-index: 10000;
                  padding: 20px;
                  font-family: system-ui, -apple-system, sans-serif;
                `;
                panel.innerHTML = `
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #2563eb; font-size: 16px;">🎯 XCLV Brand Analysis</h3>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
                  </div>
                  <div style="color: #64748b; font-size: 14px; line-height: 1.5;">
                    <p><strong>Analysis Panel Ready</strong></p>
                    <p>Use the extension popup to start brand analysis of this page.</p>
                    <p>Features available:</p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                      <li>Tone of Voice Analysis</li>
                      <li>Brand Archetype Detection</li>
                      <li>Message Clarity Scoring</li>
                      <li>Interactive Hover Analysis</li>
                    </ul>
                    <p><em>Click "Analyze Page" in the popup to begin.</em></p>
                  </div>
                `;
                document.body.appendChild(panel);
                return { success: true };
              }
            }
          });
          this.showNotification('Analysis panel opened successfully!', 'success');
        } catch (injectionError) {
          throw new Error(`Failed to show panel: ${injectionError.message}`);
        }
      }

    } catch (error) {
      console.error('XCLV Popup: Failed to show panel:', error);
      this.showNotification(`Failed to show panel: ${error.message}`, 'error');
    }
  }

  async stopAnalysis() {
    try {
      const tabs = await this.getCurrentTab();
      if (!tabs || tabs.length === 0) {
        throw new Error('No active tab found');
      }

      await this.sendMessageToTab(tabs[0].id, {
        action: 'stopAnalysis'
      });

      this.isAnalyzing = false;
      this.updateAnalysisUI(false);
      this.showNotification('Analysis stopped', 'info');

    } catch (error) {
      console.error('XCLV Popup: Failed to stop analysis:', error);
      this.showNotification(`Failed to stop analysis: ${error.message}`, 'error');
    }
  }

  async enableInteractiveMode() {
    try {
      const tabs = await this.getCurrentTab();
      if (!tabs || tabs.length === 0) {
        throw new Error('No active tab found');
      }

      // Inject content script first
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        });
      } catch (e) {
        console.log('Content script already present:', e.message);
      }

      await this.sendMessageToTab(tabs[0].id, {
        action: 'enableInteractiveMode'
      });

      this.showNotification('Interactive mode enabled - hover over text elements', 'success');

    } catch (error) {
      console.error('XCLV Popup: Failed to enable interactive mode:', error);
      this.showNotification(`Failed to enable interactive mode: ${error.message}`, 'error');
    }
  }

  async disableInteractiveMode() {
    try {
      const tabs = await this.getCurrentTab();
      if (!tabs || tabs.length === 0) {
        throw new Error('No active tab found');
      }

      await this.sendMessageToTab(tabs[0].id, {
        action: 'disableInteractiveMode'
      });

      this.showNotification('Interactive mode disabled', 'info');

    } catch (error) {
      console.error('XCLV Popup: Failed to disable interactive mode:', error);
      this.showNotification(`Failed to disable interactive mode: ${error.message}`, 'error');
    }
  }

  async saveApiSettings() {
    try {
      const apiKey = document.getElementById('api-key-input')?.value?.trim();
      const selectedModel = document.getElementById('model-select')?.value;

      if (!apiKey) {
        throw new Error('API key is required');
      }

      if (apiKey.length < 20) {
        throw new Error('API key appears to be too short');
      }

      const result = await chrome.storage.local.set({
        geminiApiKey: apiKey,
        selectedModel: selectedModel || 'gemini-2.5-flash' // KEEP 2.5 AS DEFAULT
      });

      // Update background service
      await chrome.runtime.sendMessage({
        action: 'updateApiSettings',
        data: {
          apiKey: apiKey,
          selectedModel: selectedModel || 'gemini-2.5-flash' // KEEP 2.5 AS DEFAULT
        }
      });

      this.showNotification('API settings saved successfully!', 'success');

      // Auto-collapse API section after successful save
      setTimeout(() => {
        this.toggleApiSection();
      }, 1000);

    } catch (error) {
      console.error('XCLV Popup: Failed to save API settings:', error);
      this.showNotification(`Failed to save API settings: ${error.message}`, 'error');
    }
  }

  async testApiConnection() {
    try {
      this.showNotification('Testing API connection...', 'info');

      const response = await chrome.runtime.sendMessage({
        action: 'testApiConnection'
      });

      if (response && response.success) {
        this.showNotification(`API connection successful! Model: ${response.model}`, 'success');
      } else {
        throw new Error(response?.error || 'Connection test failed');
      }

    } catch (error) {
      console.error('XCLV Popup: API test failed:', error);
      this.showNotification(`API test failed: ${error.message}`, 'error');
    }
  }

  async exportReport() {
    try {
      if (!this.analysisData) {
        throw new Error('No analysis data to export. Please run an analysis first.');
      }

      const report = this.generateMarkdownReport(this.analysisData);
      const blob = new Blob([report], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `xclv-brand-analysis-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showNotification('Report exported successfully!', 'success');

    } catch (error) {
      console.error('XCLV Popup: Export failed:', error);
      this.showNotification(`Export failed: ${error.message}`, 'error');
    }
  }

  generateMarkdownReport(data) {
    const currentUrl = window.location?.href || 'Unknown URL';

    return `# XCLV Brand Analysis Report

**Website:** ${currentUrl}
**Analysis Date:** ${new Date().toLocaleDateString()}
**Brand:** ${data.brand_name || 'Unknown'}

## Executive Summary
${data.tone_analysis?.brand_personality || 'Brand personality analysis pending'}

## Tone of Voice Analysis
${Object.entries(data.tone_analysis || {}).map(([key, value]) => 
  typeof value === 'object' && value.score ? 
  `- **${key}:** ${value.score}/100 (${value.position || 'Unknown'})` :
  `- **${key}:** ${value}`
).join('\n')}

## Brand Archetype
- **Primary:** ${data.archetype_analysis?.primary_archetype?.name || 'Unknown'} (${data.archetype_analysis?.primary_archetype?.confidence || 0}% confidence)
- **Secondary:** ${data.archetype_analysis?.secondary_archetype?.name || 'N/A'}

## Recommendations
${Array.isArray(data.recommendations?.quick_wins) ? 
  data.recommendations.quick_wins.map(rec => `- **${rec.area}:** ${rec.action}`).join('\n') : 
  'No specific recommendations available'
}

---
*Generated by XCLV Brand Intelligence Extension v1.2.7*
`;
  }

  displayAnalysisResults(data) {
    try {
      const resultsContainer = document.getElementById('analysis-results');
      if (!resultsContainer) return;

      resultsContainer.innerHTML = `
        <div class="results-section">
          <h3>Brand: ${data.brand_name || 'Unknown'}</h3>
          <p class="brand-personality">${data.tone_analysis?.brand_personality || 'Analysis completed'}</p>
          
          <div class="tone-scores">
            <h4>Tone Scores</h4>
            ${this.buildToneScoresHTML(data.tone_analysis)}
          </div>
          
          <div class="archetype-info">
            <h4>Brand Archetype</h4>
            <span class="archetype-badge">${data.archetype_analysis?.primary_archetype?.name || 'Unknown'}</span>
            <span class="confidence">${data.archetype_analysis?.primary_archetype?.confidence || 0}% confidence</span>
          </div>
        </div>
      `;

      resultsContainer.style.display = 'block';
    } catch (error) {
      console.error('XCLV Popup: Failed to display results:', error);
    }
  }

  buildToneScoresHTML(toneData) {
    if (!toneData) return '<p>No tone data available</p>';

    const dimensions = ['formality', 'warmth', 'authority', 'authenticity', 'innovation'];
    return dimensions.map(dim => {
      const score = toneData[dim]?.score || 0;
      const position = toneData[dim]?.position || 'Unknown';
      
      return `
        <div class="score-item">
          <span class="score-label">${dim}:</span>
          <span class="score-value">${score}/100</span>
          <span class="score-position">(${position})</span>
        </div>
      `;
    }).join('');
  }

  updateAnalysisUI(isAnalyzing) {
    try {
      const analyzeBtn = document.getElementById('analyze-page-btn');
      const stopBtn = document.getElementById('stop-analysis-btn');

      if (analyzeBtn) {
        analyzeBtn.disabled = isAnalyzing;
        analyzeBtn.textContent = isAnalyzing ? '⏳ Analyzing...' : '🔍 Analyze Page';
        analyzeBtn.classList.toggle('loading', isAnalyzing);
      }

      if (stopBtn) {
        stopBtn.style.display = isAnalyzing ? 'block' : 'none';
      }
    } catch (error) {
      console.error('XCLV Popup: Failed to update analysis UI:', error);
    }
  }

  showNotification(message, type = 'info') {
    try {
      const notification = document.getElementById('notification');
      if (!notification) return;

      notification.textContent = message;
      notification.className = `notification ${type}`;
      notification.style.display = 'block';

      // Auto-hide after 3 seconds
      setTimeout(() => {
        notification.style.display = 'none';
      }, 3000);

    } catch (error) {
      console.error('XCLV Popup: Failed to show notification:', error);
    }
  }

  async checkExtensionStatus() {
    try {
      const tabs = await this.getCurrentTab();
      if (!tabs || tabs.length === 0) return;

      const response = await this.sendMessageToTab(tabs[0].id, {
        action: 'getStatus'
      });

      if (response) {
        this.isAnalyzing = response.isActive;
        this.analysisData = response.data;
        this.updateAnalysisUI(this.isAnalyzing);

        if (this.analysisData) {
          this.displayAnalysisResults(this.analysisData);
        }
      }
    } catch (error) {
      console.warn('XCLV Popup: Could not check extension status:', error);
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get([
        'hoverInsights',
        'geminiApiKey',
        'selectedModel'
      ]);

      this.settings = {
        hoverInsights: result.hoverInsights !== false // Default true
      };

      // Populate API settings
      if (result.geminiApiKey) {
        const apiKeyInput = document.getElementById('api-key-input');
        if (apiKeyInput) {
          apiKeyInput.value = result.geminiApiKey;
        }
      }

      if (result.selectedModel) {
        const modelSelect = document.getElementById('model-select');
        if (modelSelect) {
          modelSelect.value = result.selectedModel;
        }
      }

    } catch (error) {
      console.error('XCLV Popup: Failed to load settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.local.set(this.settings);
    } catch (error) {
      console.error('XCLV Popup: Failed to save settings:', error);
    }
  }

  async getCurrentTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, resolve);
    });
  }

  async sendMessageToTab(tabId, message) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('XCLV Popup: Message failed:', chrome.runtime.lastError.message);
          resolve(null);
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const controller = new XCLVPopupController();
    await controller.initialize();
    
    // Make controller globally accessible for debugging
    window.xclvPopup = controller;
  } catch (error) {
    console.error('XCLV Popup: Failed to initialize:', error);
  }
});

// Handle popup unload
window.addEventListener('beforeunload', () => {
  try {
    if (window.xclvPopup) {
      window.xclvPopup.saveSettings();
    }
  } catch (error) {
    console.error('XCLV Popup: Error during unload:', error);
  }
});
