// XCLV Brand Analysis - Popup Script (FIXED)
// Extension Control Interface with Gemini 2.5 API Management

class PopupController {
  constructor() {
    this.isAnalysisActive = false;
    this.currentTab = null;
    this.analysisData = null;
    this.settings = {
      realtimeAnalysis: false,
      hoverInsights: true,
      liveScoreboard: false
    };
    this.apiConfiguration = {
      geminiApiKey: '',
      selectedModel: 'gemini-2.5-flash',
      isConfigured: false
    };
  }

  async initialize() {
    await this.loadSettings();
    await this.loadAPIConfiguration();
    await this.getCurrentTabInfo();
    this.setupEventListeners();
    this.updateUI();
    this.checkAnalysisStatus();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['xclvSettings']);
      if (result.xclvSettings) {
        this.settings = { ...this.settings, ...result.xclvSettings };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async loadAPIConfiguration() {
    try {
      const result = await chrome.storage.sync.get(['geminiApiKey', 'selectedModel']);
      this.apiConfiguration = {
        geminiApiKey: result.geminiApiKey || '',
        selectedModel: result.selectedModel || 'gemini-2.5-flash',
        isConfigured: !!(result.geminiApiKey && result.geminiApiKey.length > 10)
      };
    } catch (error) {
      console.error('Failed to load API configuration:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({ xclvSettings: this.settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  async saveAPIConfiguration() {
    try {
      await chrome.storage.sync.set({
        geminiApiKey: this.apiConfiguration.geminiApiKey,
        selectedModel: this.apiConfiguration.selectedModel
      });
    } catch (error) {
      console.error('Failed to save API configuration:', error);
    }
  }

  async getCurrentTabInfo() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
    } catch (error) {
      console.error('Failed to get current tab:', error);
    }
  }

  setupEventListeners() {
    // API Configuration
    const apiKeyInput = document.getElementById('apiKeyInput');
    const modelSelect = document.getElementById('modelSelect');
    const saveApiBtn = document.getElementById('saveApiBtn');
    const testApiBtn = document.getElementById('testApiBtn');
    const apiKeyLink = document.getElementById('apiKeyLink');

    if (apiKeyInput) {
      apiKeyInput.addEventListener('input', (e) => this.handleAPIKeyInput(e));
      apiKeyInput.addEventListener('paste', (e) => {
        setTimeout(() => this.handleAPIKeyInput({ target: e.target }), 10);
      });
    }

    if (modelSelect) {
      modelSelect.addEventListener('change', (e) => this.handleModelChange(e));
    }

    if (saveApiBtn) {
      saveApiBtn.addEventListener('click', () => this.saveAPISettings());
    }

    if (testApiBtn) {
      testApiBtn.addEventListener('click', () => this.testAPIConnection());
    }

    if (apiKeyLink) {
      apiKeyLink.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: 'https://aistudio.google.com/app/apikey' });
      });
    }

    // Main action buttons
    const analyzeBtn = document.getElementById('analyzeBtn');
    const togglePanelBtn = document.getElementById('togglePanelBtn');
    const exportBtn = document.getElementById('exportBtn');

    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => this.toggleAnalysis());
    }

    if (togglePanelBtn) {
      togglePanelBtn.addEventListener('click', () => this.togglePanel());
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportReport());
    }

    // Settings toggles
    const realtimeToggle = document.getElementById('realtimeToggle');
    const hoverToggle = document.getElementById('hoverToggle');
    const scoreboardToggle = document.getElementById('scoreboardToggle');

    if (realtimeToggle) {
      realtimeToggle.addEventListener('click', () => this.toggleSetting('realtimeAnalysis'));
    }

    if (hoverToggle) {
      hoverToggle.addEventListener('click', () => this.toggleSetting('hoverInsights'));
    }

    if (scoreboardToggle) {
      scoreboardToggle.addEventListener('click', () => this.toggleSetting('liveScoreboard'));
    }

    // Footer links
    const helpLink = document.getElementById('helpLink');
    const settingsLink = document.getElementById('settingsLink');
    const aboutLink = document.getElementById('aboutLink');

    if (helpLink) {
      helpLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openHelp();
      });
    }

    if (settingsLink) {
      settingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openSettings();
      });
    }

    if (aboutLink) {
      aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openAbout();
      });
    }
  }

  handleAPIKeyInput(e) {
    const value = e.target.value.trim();
    const testBtn = document.getElementById('testApiBtn');
    const saveBtn = document.getElementById('saveApiBtn');
    const validation = document.getElementById('keyValidation');

    // Basic validation
    if (value.length === 0) {
      testBtn.disabled = true;
      saveBtn.disabled = true;
      validation.classList.add('hidden');
    } else if (value.length < 20) {
      testBtn.disabled = true;
      saveBtn.disabled = false;
      this.showValidation('API key seems too short', 'error');
    } else if (!value.startsWith('AIza')) {
      testBtn.disabled = true;
      saveBtn.disabled = false;
      this.showValidation('Invalid Gemini API key format', 'error');
    } else {
      testBtn.disabled = false;
      saveBtn.disabled = false;
      this.showValidation('API key format looks valid', 'success');
    }

    this.apiConfiguration.geminiApiKey = value;
  }

  handleModelChange(e) {
    this.apiConfiguration.selectedModel = e.target.value;
    this.updateModelInfo();
    this.updateCostEstimate();
  }

  showValidation(message, type) {
    const validation = document.getElementById('keyValidation');
    if (!validation) return;

    validation.textContent = message;
    validation.className = `validation-message validation-${type}`;
    validation.classList.remove('hidden');
  }

  updateModelInfo() {
    const modelInfo = document.getElementById('modelInfo');
    if (!modelInfo) return;

    const modelDescriptions = {
      'gemini-2.5-flash': 'Latest AI model with enhanced reasoning and speed',
      'gemini-2.5-flash-lite': 'Ultra-fast processing with optimized performance',
      'gemini-2.5-pro': 'Most advanced model with superior analytical capabilities'
    };

    modelInfo.textContent = modelDescriptions[this.apiConfiguration.selectedModel] || 'Advanced Gemini 2.5 AI model';
  }

  updateCostEstimate() {
    const costEstimate = document.getElementById('costEstimate');
    if (!costEstimate) return;

    const costEstimates = {
      'gemini-2.5-flash': '$0.005-0.015 per analysis',
      'gemini-2.5-flash-lite': '$0.003-0.010 per analysis',
      'gemini-2.5-pro': '$0.015-0.050 per analysis'
    };

    costEstimate.textContent = `Estimated cost: ${costEstimates[this.apiConfiguration.selectedModel] || '$0.005-0.02 per analysis'}`;
  }

  async saveAPISettings() {
    const saveBtn = document.getElementById('saveApiBtn');
    if (!saveBtn) return;

    saveBtn.innerHTML = 'Saving... <span class="loading-spinner"></span>';
    saveBtn.disabled = true;

    try {
      await this.saveAPIConfiguration();
      this.apiConfiguration.isConfigured = !!(this.apiConfiguration.geminiApiKey && this.apiConfiguration.geminiApiKey.length > 10);
      this.updateAPIStatus();
      this.showNotification('API settings saved successfully');
    } catch (error) {
      console.error('Failed to save API settings:', error);
      this.showNotification('Failed to save settings', 'error');
    } finally {
      saveBtn.innerHTML = 'Save';
      saveBtn.disabled = false;
    }
  }

  async testAPIConnection() {
    const testBtn = document.getElementById('testApiBtn');
    if (!testBtn) return;

    testBtn.innerHTML = 'Testing... <span class="loading-spinner"></span>';
    testBtn.disabled = true;

    try {
      // Save current settings first
      await this.saveAPIConfiguration();

      // Test the API connection with Gemini 2.5
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.apiConfiguration.selectedModel}:generateContent?key=${this.apiConfiguration.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello, respond with just "Gemini 2.5 API connection successful"'
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 50
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.candidates && data.candidates[0]) {
          this.apiConfiguration.isConfigured = true;
          this.showValidation('Gemini 2.5 API connection successful!', 'success');
          this.showNotification('Gemini 2.5 API connected successfully');
          this.updateAPIStatus();
        } else {
          throw new Error('Invalid API response format');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('API test failed:', error);
      this.apiConfiguration.isConfigured = false;
      this.showValidation(`Connection failed: ${error.message}`, 'error');
      this.showNotification('API connection failed', 'error');
      this.updateAPIStatus();
    } finally {
      testBtn.innerHTML = 'Test';
      testBtn.disabled = false;
    }
  }

  updateUI() {
    this.updateAPIStatus();
    this.updateAnalysisStatus();
    this.updateSettingsToggles();
    this.updateQuickStats();
    this.updateBrandPreview();
    this.updateModelInfo();
    this.updateCostEstimate();
    this.populateAPIForm();
  }

  updateAPIStatus() {
    const apiSetup = document.getElementById('apiSetup');
    const apiStatusText = document.getElementById('apiStatusText');
    const analyzeBtn = document.getElementById('analyzeBtn');

    if (this.apiConfiguration.isConfigured) {
      apiSetup.classList.add('configured');
      const modelDisplayName = this.getModelDisplayName(this.apiConfiguration.selectedModel);
      apiStatusText.textContent = `Gemini 2.5 API configured (${modelDisplayName})`;
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = this.isAnalysisActive ? 'Stop Analysis' : 'Start Brand Analysis';
    } else {
      apiSetup.classList.remove('configured');
      apiStatusText.textContent = 'Configure Gemini 2.5 API to enable brand analysis';
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = 'Configure API First';
    }
  }

  getModelDisplayName(modelId) {
    const modelNames = {
      'gemini-2.5-flash': 'Flash',
      'gemini-2.5-flash-lite': 'Flash-Lite',
      'gemini-2.5-pro': 'Pro'
    };
    return modelNames[modelId] || modelId;
  }

  populateAPIForm() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const modelSelect = document.getElementById('modelSelect');

    if (apiKeyInput && this.apiConfiguration.geminiApiKey) {
      apiKeyInput.value = this.apiConfiguration.geminiApiKey;
    }

    if (modelSelect) {
      modelSelect.value = this.apiConfiguration.selectedModel;
    }

    // Trigger validation for existing key
    if (apiKeyInput && this.apiConfiguration.geminiApiKey) {
      this.handleAPIKeyInput({ target: apiKeyInput });
    }
  }

  updateAnalysisStatus() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');

    if (this.isAnalysisActive) {
      statusIndicator.classList.remove('inactive');
      statusIndicator.classList.add('active');
      statusText.textContent = 'Analysis Active';
    } else {
      statusIndicator.classList.remove('active');
      statusIndicator.classList.add('inactive');
      statusText.textContent = 'Analysis Inactive';
    }
  }

  updateSettingsToggles() {
    const realtimeToggle = document.getElementById('realtimeToggle');
    const hoverToggle = document.getElementById('hoverToggle');
    const scoreboardToggle = document.getElementById('scoreboardToggle');

    if (realtimeToggle) {
      realtimeToggle.classList.toggle('active', this.settings.realtimeAnalysis);
    }

    if (hoverToggle) {
      hoverToggle.classList.toggle('active', this.settings.hoverInsights);
    }

    if (scoreboardToggle) {
      scoreboardToggle.classList.toggle('active', this.settings.liveScoreboard);
    }
  }

  updateQuickStats() {
    const overallScore = document.getElementById('overallScore');
    const pageElements = document.getElementById('pageElements');
    const clarityAvg = document.getElementById('clarityAvg');
    const analysisTime = document.getElementById('analysisTime');

    if (this.analysisData) {
      // Update with real data
      if (overallScore) {
        const score = this.calculateOverallScore(this.analysisData);
        overallScore.textContent = score;
      }

      if (pageElements) {
        const elements = this.countPageElements(this.analysisData);
        pageElements.textContent = elements;
      }

      if (clarityAvg) {
        const clarity = this.calculateClarityAverage(this.analysisData);
        clarityAvg.textContent = clarity;
      }

      if (analysisTime) {
        analysisTime.textContent = '< 1s';
      }
    } else {
      // Show placeholders
      if (overallScore) overallScore.textContent = '--';
      if (pageElements) pageElements.textContent = '--';
      if (clarityAvg) clarityAvg.textContent = '--';
      if (analysisTime) analysisTime.textContent = '--';
    }
  }

  updateBrandPreview() {
    const brandPreview = document.getElementById('brandPreview');
    const previewContent = document.getElementById('previewContent');
    const primaryArchetype = document.getElementById('primaryArchetype');

    if (this.analysisData) {
      brandPreview.classList.remove('hidden');
      
      if (previewContent) {
        const preview = this.generateBrandPreview(this.analysisData);
        previewContent.textContent = preview;
      }

      if (primaryArchetype && this.analysisData.archetypes) {
        const archetype = this.analysisData.archetypes.primaryArchetype;
        primaryArchetype.textContent = archetype?.name || 'Unknown';
      }
    } else {
      brandPreview.classList.add('hidden');
    }
  }

  async toggleAnalysis() {
    if (!this.apiConfiguration.isConfigured) {
      this.showNotification('Please configure Gemini 2.5 API first', 'error');
      return;
    }

    if (!this.currentTab) {
      this.showNotification('No active tab found', 'error');
      return;
    }

    const analyzeBtn = document.getElementById('analyzeBtn');
    
    try {
      if (this.isAnalysisActive) {
        // Stop analysis
        await this.sendMessageToTab('stopAnalysis');
        this.isAnalysisActive = false;
        this.showNotification('Analysis stopped');
      } else {
        // Start analysis
        analyzeBtn.innerHTML = 'Starting... <span class="loading-spinner"></span>';
        analyzeBtn.disabled = true;
        
        await this.sendMessageToTab('startAnalysis');
        this.isAnalysisActive = true;
        
        // Get analysis results
        setTimeout(async () => {
          await this.refreshAnalysisData();
        }, 2000);
        
        this.showNotification('Brand analysis started with Gemini 2.5');
      }
    } catch (error) {
      console.error('Analysis toggle failed:', error);
      this.showNotification('Analysis failed to start', 'error');
    } finally {
      if (analyzeBtn) {
        analyzeBtn.disabled = !this.apiConfiguration.isConfigured;
        analyzeBtn.innerHTML = this.isAnalysisActive ? 'Stop Analysis' : 'Start Brand Analysis';
      }
    }

    this.updateAnalysisStatus();
  }

  async togglePanel() {
    if (!this.currentTab) return;

    try {
      if (this.isAnalysisActive) {
        await this.sendMessageToTab('showPanel');
        this.showNotification('Analysis panel shown');
      } else {
        await this.sendMessageToTab('hidePanel');
        this.showNotification('Analysis panel hidden');
      }
    } catch (error) {
      console.error('Panel toggle failed:', error);
    }
  }

  async exportReport() {
    if (!this.analysisData) {
      this.showNotification('No analysis data to export', 'error');
      return;
    }

    try {
      const report = {
        url: this.currentTab?.url || 'unknown',
        timestamp: new Date().toISOString(),
        domain: this.currentTab?.url ? new URL(this.currentTab.url).hostname : 'unknown',
        model: this.apiConfiguration.selectedModel,
        modelVersion: 'Gemini 2.5',
        analysis: this.analysisData,
        summary: {
          overallScore: this.calculateOverallScore(this.analysisData),
          primaryArchetype: this.analysisData.archetypes?.primaryArchetype?.name || 'Unknown',
          dominantTone: this.analysisData.tone?.dominantTone || 'Unknown',
          brandPersonality: this.analysisData.tone?.brandPersonality || 'Unknown'
        }
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const filename = `xclv-brand-analysis-gemini25-${Date.now()}.json`;
      
      // Use Chrome downloads API
      chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      });

      this.showNotification('Report exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      this.showNotification('Export failed', 'error');
    }
  }

  async toggleSetting(settingName) {
    this.settings[settingName] = !this.settings[settingName];
    await this.saveSettings();
    this.updateSettingsToggles();
    
    // Apply setting changes to content script
    if (this.currentTab) {
      await this.sendMessageToTab('updateSettings', this.settings);
    }
    
    this.showNotification(`${this.getSettingDisplayName(settingName)} ${this.settings[settingName] ? 'enabled' : 'disabled'}`);
  }

  getSettingDisplayName(settingName) {
    const names = {
      realtimeAnalysis: 'Real-time Analysis',
      hoverInsights: 'Hover Insights',
      liveScoreboard: 'Live Scoreboard'
    };
    return names[settingName] || settingName;
  }

  // FIXED: Modern Promise-based messaging for Manifest V3
  async sendMessageToTab(action, data = null) {
    if (!this.currentTab) {
      throw new Error('No active tab');
    }

    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, { action, data });
      return response;
    } catch (error) {
      // Handle cases where content script isn't loaded yet
      if (error.message.includes('Could not establish connection')) {
        // Try to inject content script
        try {
          await chrome.scripting.executeScript({
            target: { tabId: this.currentTab.id },
            files: ['content.js']
          });
          
          // Wait a moment and retry
          await new Promise(resolve => setTimeout(resolve, 100));
          const response = await chrome.tabs.sendMessage(this.currentTab.id, { action, data });
          return response;
        } catch (retryError) {
          throw new Error('Failed to communicate with page. Please refresh and try again.');
        }
      }
      throw error;
    }
  }

  async checkAnalysisStatus() {
    if (!this.currentTab) return;

    try {
      // Check if analysis is currently active
      const response = await this.sendMessageToTab('getStatus');
      if (response?.isActive) {
        this.isAnalysisActive = true;
        this.analysisData = response.data;
        this.updateUI();
      }
    } catch (error) {
      // Content script might not be loaded yet, which is fine
      console.log('Status check failed (content script not ready):', error.message);
    }
  }

  async refreshAnalysisData() {
    if (!this.currentTab) return;

    try {
      const response = await this.sendMessageToTab('getAnalysisData');
      if (response?.data) {
        this.analysisData = response.data;
        this.updateUI();
        
        // Enable export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
          exportBtn.disabled = false;
        }
      }
    } catch (error) {
      console.error('Data refresh failed:', error);
    }
  }

  calculateOverallScore(data) {
    if (!data) return 0;

    let score = 70; // Base score
    
    if (data.tone && data.tone.scores) {
      const toneScores = Object.values(data.tone.scores);
      const toneAvg = toneScores.reduce((a, b) => a + b, 0) / toneScores.length;
      score = Math.round(toneAvg);
    }

    return Math.max(0, Math.min(100, score));
  }

  countPageElements(data) {
    let count = 0;
    
    if (data.headlines) count += data.headlines.length;
    if (data.ctas) count += data.ctas.length;
    if (data.navigation) count += data.navigation.length;
    
    return count;
  }

  calculateClarityAverage(data) {
    if (!data.tone || !data.tone.scores) return 0;
    
    // Use formality and authenticity as clarity indicators
    const clarity = (data.tone.scores.formality + data.tone.scores.authenticity) / 2;
    return Math.round(clarity);
  }

  generateBrandPreview(data) {
    const parts = [];
    
    if (data.tone?.dominantTone) {
      parts.push(`Tone: ${data.tone.dominantTone}`);
    }
    
    if (data.tone?.brandPersonality) {
      parts.push(`Personality: ${data.tone.brandPersonality}`);
    }
    
    if (data.archetypes?.archetypeAlignment) {
      parts.push(`Alignment: ${data.archetypes.archetypeAlignment}`);
    }
    
    return parts.length > 0 ? parts.join('. ') : 'Analysis in progress...';
  }

  openHelp() {
    chrome.tabs.create({
      url: 'https://docs.xclv.ai/brand-analysis-extension'
    });
  }

  openSettings() {
    chrome.runtime.openOptionsPage();
  }

  openAbout() {
    chrome.tabs.create({
      url: 'https://xclv.ai/about'
    });
  }

  showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
}

// Utility functions for background page communication
class BackgroundAPI {
  static async getStoredAnalysis(url) {
    return new Promise((resolve) => {
      chrome.storage.local.get([`analysis_${url}`], (result) => {
        resolve(result[`analysis_${url}`] || null);
      });
    });
  }

  static async storeAnalysis(url, data) {
    const key = `analysis_${url}`;
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: data }, resolve);
    });
  }

  static async clearStoredAnalyses() {
    return new Promise((resolve) => {
      chrome.storage.local.clear(resolve);
    });
  }
}

// Tab visibility handling
class TabVisibilityManager {
  constructor(popupController) {
    this.popupController = popupController;
    this.setupVisibilityHandlers();
  }

  setupVisibilityHandlers() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Popup became visible, refresh data
        this.popupController.refreshAnalysisData();
      }
    });

    // Also refresh when popup is opened
    window.addEventListener('focus', () => {
      this.popupController.refreshAnalysisData();
    });
  }
}

// Keyboard shortcuts
class KeyboardShortcuts {
  constructor(popupController) {
    this.popupController = popupController;
    this.setupShortcuts();
  }

  setupShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt + A: Toggle analysis
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        this.popupController.toggleAnalysis();
      }

      // Alt + P: Toggle panel
      if (e.altKey && e.key === 'p') {
        e.preventDefault();
        this.popupController.togglePanel();
      }

      // Alt + E: Export report
      if (e.altKey && e.key === 'e') {
        e.preventDefault();
        this.popupController.exportReport();
      }

      // Alt + S: Save API settings
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        this.popupController.saveAPISettings();
      }

      // Alt + T: Test API connection
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        this.popupController.testAPIConnection();
      }

      // Escape: Close popup
      if (e.key === 'Escape') {
        window.close();
      }
    });
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const popupController = new PopupController();
  await popupController.initialize();

  // Initialize additional managers
  new TabVisibilityManager(popupController);
  new KeyboardShortcuts(popupController);

  // Auto-refresh data every 30 seconds if analysis is active
  setInterval(() => {
    if (popupController.isAnalysisActive) {
      popupController.refreshAnalysisData();
    }
  }, 30000);
});

// Handle popup close
window.addEventListener('beforeunload', () => {
  // Save any pending state changes
  console.log('XCLV popup closing');
});
