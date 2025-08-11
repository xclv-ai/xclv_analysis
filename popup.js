// XCLV Brand Analysis - Enhanced Popup with Interactive Mode

class XCLVPopupController {
  constructor() {
    this.isAnalyzing = false;
    this.isInteractiveMode = false;
    this.currentTab = null;
    this.analysisData = null;
  }

  async initialize() {
    try {
      await this.loadSettings();
      this.setupEventListeners();
      await this.updateStatus();
      console.log('XCLV Popup initialized');
    } catch (error) {
      console.error('Failed to initialize popup:', error);
      this.showError('Initialization failed: ' + error.message);
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get([
        'xclvSettings',
        'geminiApiKey',
        'selectedModel'
      ]);
      
      this.settings = result.xclvSettings || {
        realtimeAnalysis: false,
        hoverInsights: true,
        liveScoreboard: false,
        interactiveMode: false
      };
      
      this.updateUI();
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  setupEventListeners() {
    // Main action buttons
    const startBtn = document.getElementById('startAnalysis');
    const stopBtn = document.getElementById('stopAnalysis');
    const showPanelBtn = document.getElementById('showPanel');
    const exportBtn = document.getElementById('exportReport');
    
    // Interactive mode controls
    const interactiveModeToggle = document.getElementById('interactiveMode');
    const debugConsoleBtn = document.getElementById('debugConsole');
    
    // Settings toggles
    const realtimeToggle = document.getElementById('realtimeAnalysis');
    const hoverToggle = document.getElementById('hoverInsights');
    const scoreboardToggle = document.getElementById('liveScoreboard');
    
    // API Configuration
    const testApiBtn = document.getElementById('testApi');
    const saveSettingsBtn = document.getElementById('saveSettings');
    
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startAnalysis());
    }
    
    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stopAnalysis());
    }
    
    if (showPanelBtn) {
      showPanelBtn.addEventListener('click', () => this.showPanel());
    }
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportReport());
    }
    
    if (interactiveModeToggle) {
      interactiveModeToggle.addEventListener('change', (e) => {
        this.toggleInteractiveMode(e.target.checked);
      });
    }
    
    if (debugConsoleBtn) {
      debugConsoleBtn.addEventListener('click', () => this.openDebugConsole());
    }
    
    if (realtimeToggle) {
      realtimeToggle.addEventListener('change', (e) => {
        this.updateSetting('realtimeAnalysis', e.target.checked);
      });
    }
    
    if (hoverToggle) {
      hoverToggle.addEventListener('change', (e) => {
        this.updateSetting('hoverInsights', e.target.checked);
      });
    }
    
    if (scoreboardToggle) {
      scoreboardToggle.addEventListener('change', (e) => {
        this.updateSetting('liveScoreboard', e.target.checked);
      });
    }
    
    if (testApiBtn) {
      testApiBtn.addEventListener('click', () => this.testApiConnection());
    }
    
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.close();
      }
    });
  }

  updateUI() {
    // Update toggle states
    const interactiveModeToggle = document.getElementById('interactiveMode');
    const realtimeToggle = document.getElementById('realtimeAnalysis');
    const hoverToggle = document.getElementById('hoverInsights');
    const scoreboardToggle = document.getElementById('liveScoreboard');
    
    if (interactiveModeToggle) {
      interactiveModeToggle.checked = this.settings.interactiveMode;
    }
    
    if (realtimeToggle) {
      realtimeToggle.checked = this.settings.realtimeAnalysis;
    }
    
    if (hoverToggle) {
      hoverToggle.checked = this.settings.hoverInsights;
    }
    
    if (scoreboardToggle) {
      scoreboardToggle.checked = this.settings.liveScoreboard;
    }
    
    // Update interactive mode status
    this.updateInteractiveModeStatus();
  }

  updateInteractiveModeStatus() {
    const statusElement = document.getElementById('interactiveModeStatus');
    const instructionsElement = document.getElementById('interactiveInstructions');
    
    if (statusElement) {
      statusElement.textContent = this.isInteractiveMode ? 'ACTIVE' : 'INACTIVE';
      statusElement.className = `status ${this.isInteractiveMode ? 'active' : 'inactive'}`;
    }
    
    if (instructionsElement) {
      instructionsElement.style.display = this.isInteractiveMode ? 'block' : 'none';
    }
  }

  async toggleInteractiveMode(enabled) {
    try {
      this.isInteractiveMode = enabled;
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (enabled) {
        await chrome.tabs.sendMessage(tab.id, { action: 'enableInteractiveMode' });
        this.showSuccess('Interactive analysis mode enabled! Hover over text elements to analyze.');
      } else {
        await chrome.tabs.sendMessage(tab.id, { action: 'disableInteractiveMode' });
        this.showSuccess('Interactive analysis mode disabled.');
      }
      
      await this.updateSetting('interactiveMode', enabled);
      this.updateInteractiveModeStatus();
      
    } catch (error) {
      console.error('Failed to toggle interactive mode:', error);
      this.showError('Failed to toggle interactive mode: ' + error.message);
      
      // Reset toggle if failed
      const toggle = document.getElementById('interactiveMode');
      if (toggle) {
        toggle.checked = !enabled;
      }
    }
  }

  async openDebugConsole() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Execute debug console script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Create debug console if it doesn't exist
          if (!window.xclvDebugConsole) {
            window.xclvDebugConsole = {
              log: (...args) => {
                console.log('%c[XCLV DEBUG]', 'color: #4CAF50; font-weight: bold;', ...args);
              },
              extractContent: () => {
                if (window.xclvController && window.xclvController.extractor) {
                  return window.xclvController.extractor.extractPageContent();
                }
                return null;
              },
              getAnalysisData: () => {
                if (window.xclvController && window.xclvController.extractor) {
                  return window.xclvController.extractor.analysisData;
                }
                return null;
              },
              testAnalysis: (text) => {
                if (window.xclvController) {
                  return window.xclvController.interactiveAnalyzer.analyzeElement({
                    textContent: text || 'Test analysis text'
                  });
                }
                return null;
              }
            };
          }
          
          window.xclvDebugConsole.log('XCLV Debug Console initialized');
          window.xclvDebugConsole.log('Available commands:');
          window.xclvDebugConsole.log('- xclvDebugConsole.extractContent(): Extract page content');
          window.xclvDebugConsole.log('- xclvDebugConsole.getAnalysisData(): Get current analysis');
          window.xclvDebugConsole.log('- xclvDebugConsole.testAnalysis(text): Test analysis function');
          
          alert('XCLV Debug Console opened in browser console.\nPress F12 to open DevTools and use xclvDebugConsole commands.');
        }
      });
      
      this.showSuccess('Debug console opened in browser DevTools (F12)');
      
    } catch (error) {
      console.error('Failed to open debug console:', error);
      this.showError('Failed to open debug console: ' + error.message);
    }
  }

  async startAnalysis() {
    if (this.isAnalyzing) return;
    
    try {
      this.setAnalyzing(true);
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'startAnalysis'
      });
      
      if (response && response.success) {
        this.analysisData = response.data;
        this.showSuccess('Analysis completed successfully!');
        await this.updateAnalysisDisplay(response.data);
      } else {
        throw new Error(response?.error || 'Analysis failed');
      }
      
    } catch (error) {
      console.error('Analysis failed:', error);
      this.showError('Analysis failed: ' + error.message);
    } finally {
      this.setAnalyzing(false);
    }
  }

  async stopAnalysis() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      await chrome.tabs.sendMessage(tab.id, {
        action: 'stopAnalysis'
      });
      
      this.setAnalyzing(false);
      this.analysisData = null;
      this.showSuccess('Analysis stopped');
      
    } catch (error) {
      console.error('Failed to stop analysis:', error);
      this.showError('Failed to stop analysis: ' + error.message);
    }
  }

  async showPanel() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      await chrome.tabs.sendMessage(tab.id, {
        action: 'showPanel'
      });
      
      this.showSuccess('Analysis panel shown');
      
    } catch (error) {
      console.error('Failed to show panel:', error);
      this.showError('Failed to show panel: ' + error.message);
    }
  }

  async exportReport() {
    if (!this.analysisData) {
      this.showError('No analysis data to export. Run analysis first.');
      return;
    }
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const reportData = {
        ...this.analysisData,
        exportedAt: new Date().toISOString(),
        url: tab.url,
        title: tab.title
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const filename = `xclv-analysis-${new Date().toISOString().split('T')[0]}.json`;
      
      await chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      });
      
      this.showSuccess('Report exported successfully!');
      
    } catch (error) {
      console.error('Failed to export report:', error);
      this.showError('Failed to export report: ' + error.message);
    }
  }

  async testApiConnection() {
    try {
      const result = await chrome.storage.local.get(['geminiApiKey', 'selectedModel']);
      
      if (!result.geminiApiKey) {
        this.showError('Please configure your Gemini API key first');
        return;
      }
      
      this.setTesting(true);
      
      const response = await chrome.runtime.sendMessage({
        action: 'testApiConnection'
      });
      
      if (response && response.success) {
        this.showSuccess('API connection successful!');
      } else {
        throw new Error(response?.error || 'API test failed');
      }
      
    } catch (error) {
      console.error('API test failed:', error);
      this.showError('API test failed: ' + error.message);
    } finally {
      this.setTesting(false);
    }
  }

  async saveSettings() {
    try {
      const apiKey = document.getElementById('geminiApiKey')?.value;
      const model = document.getElementById('selectedModel')?.value;
      
      if (apiKey) {
        await chrome.storage.local.set({ 
          geminiApiKey: apiKey,
          selectedModel: model || 'gemini-2.5-flash'
        });
      }
      
      await chrome.storage.local.set({ xclvSettings: this.settings });
      
      this.showSuccess('Settings saved successfully!');
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showError('Failed to save settings: ' + error.message);
    }
  }

  async updateSetting(key, value) {
    this.settings[key] = value;
    
    try {
      // Save to storage
      await chrome.storage.local.set({ xclvSettings: this.settings });
      
      // Send to content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      await chrome.tabs.sendMessage(tab.id, {
        action: 'updateSettings',
        data: { [key]: value }
      });
      
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  }

  async updateStatus() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'getStatus'
      });
      
      if (response) {
        this.isAnalyzing = response.isActive || false;
        this.analysisData = response.data || null;
        
        if (this.analysisData) {
          await this.updateAnalysisDisplay(this.analysisData);
        }
      }
      
      this.updateButtonStates();
      
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  async updateAnalysisDisplay(data) {
    const resultsContainer = document.getElementById('analysisResults');
    if (!resultsContainer || !data) return;
    
    try {
      let html = '<div class="analysis-summary">';
      
      // Overall Score
      if (data.tone && data.tone.scores) {
        const scores = Object.values(data.tone.scores);
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        
        html += `
          <div class="score-display">
            <div class="score-number">${avgScore}</div>
            <div class="score-label">Brand Score</div>
          </div>
        `;
      }
      
      // Key Insights
      html += '<div class="key-insights">';
      
      if (data.tone && data.tone.dominantTone) {
        html += `<div class="insight"><strong>Tone:</strong> ${data.tone.dominantTone}</div>`;
      }
      
      if (data.archetypes && data.archetypes.primaryArchetype) {
        html += `<div class="insight"><strong>Archetype:</strong> ${data.archetypes.primaryArchetype.name}</div>`;
      }
      
      if (data.tone && data.tone.brandPersonality) {
        html += `<div class="insight"><strong>Personality:</strong> ${data.tone.brandPersonality}</div>`;
      }
      
      html += '</div></div>';
      
      resultsContainer.innerHTML = html;
      resultsContainer.style.display = 'block';
      
    } catch (error) {
      console.error('Failed to update analysis display:', error);
    }
  }

  setAnalyzing(analyzing) {
    this.isAnalyzing = analyzing;
    this.updateButtonStates();
  }

  setTesting(testing) {
    const testBtn = document.getElementById('testApi');
    if (testBtn) {
      testBtn.disabled = testing;
      testBtn.textContent = testing ? 'Testing...' : 'Test API';
    }
  }

  updateButtonStates() {
    const startBtn = document.getElementById('startAnalysis');
    const stopBtn = document.getElementById('stopAnalysis');
    const showPanelBtn = document.getElementById('showPanel');
    const exportBtn = document.getElementById('exportReport');
    
    if (startBtn) {
      startBtn.disabled = this.isAnalyzing;
      startBtn.textContent = this.isAnalyzing ? 'Analyzing...' : 'Start Analysis';
    }
    
    if (stopBtn) {
      stopBtn.disabled = !this.isAnalyzing;
    }
    
    if (showPanelBtn) {
      showPanelBtn.disabled = !this.analysisData;
    }
    
    if (exportBtn) {
      exportBtn.disabled = !this.analysisData;
    }
  }

  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  showError(message) {
    this.showMessage(message, 'error');
  }

  showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer') || 
                           document.querySelector('.message-container');
    
    if (messageContainer) {
      messageContainer.innerHTML = `
        <div class="message ${type}">
          ${message}
        </div>
      `;
      
      setTimeout(() => {
        messageContainer.innerHTML = '';
      }, 3000);
    } else {
      // Fallback to console
      console.log(`XCLV ${type.toUpperCase()}: ${message}`);
    }
  }
}

// Initialize popup controller
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const controller = new XCLVPopupController();
    await controller.initialize();
    
    // Make controller globally available for debugging
    window.xclvPopupController = controller;
    
  } catch (error) {
    console.error('Failed to initialize XCLV popup:', error);
  }
});