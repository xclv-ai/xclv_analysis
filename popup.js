// XCLV Brand Analysis - Fixed Popup Controller
// Matches the actual HTML IDs and elements

class XCLVPopupController {
  constructor() {
    this.isAnalyzing = false;
    this.isInteractiveMode = false;
    this.currentTab = null;
    this.analysisData = null;
    this.apiKey = null;
    this.selectedModel = 'gemini-2.5-flash';
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
      
      this.apiKey = result.geminiApiKey;
      this.selectedModel = result.selectedModel || 'gemini-2.5-flash';
      
      this.updateUI();
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  setupEventListeners() {
    // Main action buttons - using correct IDs from HTML
    const analyzeBtn = document.getElementById('analyzeBtn');
    const interactiveModeBtn = document.getElementById('interactiveModeBtn');
    const togglePanelBtn = document.getElementById('togglePanelBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    // API Configuration
    const saveApiBtn = document.getElementById('saveApiBtn');
    const testApiBtn = document.getElementById('testApiBtn');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const modelSelect = document.getElementById('modelSelect');
    
    // Settings toggles
    const realtimeToggle = document.getElementById('realtimeToggle');
    const hoverToggle = document.getElementById('hoverToggle');
    const scoreboardToggle = document.getElementById('scoreboardToggle');
    
    // Links
    const apiKeyLink = document.getElementById('apiKeyLink');
    
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => this.toggleAnalysis());
    }
    
    if (interactiveModeBtn) {
      interactiveModeBtn.addEventListener('click', () => this.toggleInteractiveMode());
    }
    
    if (togglePanelBtn) {
      togglePanelBtn.addEventListener('click', () => this.showPanel());
    }
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportReport());
    }
    
    if (saveApiBtn) {
      saveApiBtn.addEventListener('click', () => this.saveApiSettings());
    }
    
    if (testApiBtn) {
      testApiBtn.addEventListener('click', () => this.testApiConnection());
    }
    
    if (apiKeyInput) {
      apiKeyInput.addEventListener('input', () => this.validateApiKey());
      apiKeyInput.addEventListener('paste', () => {
        setTimeout(() => this.validateApiKey(), 100);
      });
    }
    
    if (modelSelect) {
      modelSelect.addEventListener('change', () => this.updateModelInfo());
    }
    
    if (realtimeToggle) {
      realtimeToggle.addEventListener('click', () => {
        this.toggleSetting('realtimeAnalysis', realtimeToggle);
      });
    }
    
    if (hoverToggle) {
      hoverToggle.addEventListener('click', () => {
        this.toggleSetting('hoverInsights', hoverToggle);
      });
    }
    
    if (scoreboardToggle) {
      scoreboardToggle.addEventListener('click', () => {
        this.toggleSetting('liveScoreboard', scoreboardToggle);
      });
    }
    
    if (apiKeyLink) {
      apiKeyLink.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: 'https://aistudio.google.com/app/apikey' });
      });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.close();
      }
    });
  }

  updateUI() {
    // Update API configuration
    const apiKeyInput = document.getElementById('apiKeyInput');
    const modelSelect = document.getElementById('modelSelect');
    const apiSetup = document.getElementById('apiSetup');
    const apiStatusText = document.getElementById('apiStatusText');
    
    if (apiKeyInput && this.apiKey) {
      apiKeyInput.value = this.apiKey;
    }
    
    if (modelSelect) {
      modelSelect.value = this.selectedModel;
    }
    
    if (apiSetup && apiStatusText) {
      if (this.apiKey) {
        apiSetup.classList.add('configured');
        apiStatusText.textContent = 'Gemini 2.5 API configured and ready';
      } else {
        apiSetup.classList.remove('configured');
        apiStatusText.textContent = 'Configure Gemini 2.5 API to enable brand analysis';
      }
    }
    
    // Update toggle states
    this.updateToggleState('realtimeToggle', this.settings.realtimeAnalysis);
    this.updateToggleState('hoverToggle', this.settings.hoverInsights);
    this.updateToggleState('scoreboardToggle', this.settings.liveScoreboard);
    
    // Update button states
    this.updateButtonStates();
    this.updateModelInfo();
  }

  updateToggleState(toggleId, isActive) {
    const toggle = document.getElementById(toggleId);
    if (toggle) {
      if (isActive) {
        toggle.classList.add('active');
      } else {
        toggle.classList.remove('active');
      }
    }
  }

  validateApiKey() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const testApiBtn = document.getElementById('testApiBtn');
    const keyValidation = document.getElementById('keyValidation');
    
    if (!apiKeyInput) return;
    
    const key = apiKeyInput.value.trim();
    
    if (key.length === 0) {
      if (testApiBtn) testApiBtn.disabled = true;
      if (keyValidation) {
        keyValidation.classList.add('hidden');
      }
      return;
    }
    
    if (key.length < 20) {
      if (testApiBtn) testApiBtn.disabled = true;
      if (keyValidation) {
        keyValidation.textContent = 'API key appears too short';
        keyValidation.className = 'validation-message validation-error';
      }
    } else {
      if (testApiBtn) testApiBtn.disabled = false;
      if (keyValidation) {
        keyValidation.textContent = 'API key format looks valid';
        keyValidation.className = 'validation-message validation-success';
      }
    }
  }

  updateModelInfo() {
    const modelSelect = document.getElementById('modelSelect');
    const modelInfo = document.getElementById('modelInfo');
    const costEstimate = document.getElementById('costEstimate');
    
    if (!modelSelect) return;
    
    const model = modelSelect.value;
    
    const modelData = {
      'gemini-2.5-flash': {
        info: 'Latest AI model with enhanced reasoning and speed',
        cost: '$0.005-0.02 per analysis'
      },
      'gemini-2.5-flash-lite': {
        info: 'Fastest model optimized for real-time analysis',
        cost: '$0.001-0.01 per analysis'
      },
      'gemini-2.5-pro': {
        info: 'Most advanced model for complex brand analysis',
        cost: '$0.02-0.08 per analysis'
      }
    };
    
    if (modelInfo) {
      modelInfo.textContent = modelData[model]?.info || 'AI model for brand analysis';
    }
    
    if (costEstimate) {
      costEstimate.textContent = `Estimated cost: ${modelData[model]?.cost || '$0.005-0.02 per analysis'}`;
    }
  }

  async toggleAnalysis() {
    if (!this.apiKey) {
      this.showError('Please configure your Gemini API key first');
      return;
    }
    
    if (this.isAnalyzing) {
      await this.stopAnalysis();
    } else {
      await this.startAnalysis();
    }
  }

  async toggleInteractiveMode() {
    try {
      this.isInteractiveMode = !this.isInteractiveMode;
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (this.isInteractiveMode) {
        await chrome.tabs.sendMessage(tab.id, { action: 'enableInteractiveMode' });
        this.showSuccess('Interactive analysis mode enabled! Hover over text elements.');
      } else {
        await chrome.tabs.sendMessage(tab.id, { action: 'disableInteractiveMode' });
        this.showSuccess('Interactive analysis mode disabled.');
      }
      
      await this.updateSetting('interactiveMode', this.isInteractiveMode);
      this.updateInteractiveModeUI();
      
    } catch (error) {
      console.error('Failed to toggle interactive mode:', error);
      this.showError('Failed to toggle interactive mode');
      this.isInteractiveMode = !this.isInteractiveMode; // Revert
    }
  }

  updateInteractiveModeUI() {
    const interactiveModeBtn = document.getElementById('interactiveModeBtn');
    const interactiveModeInfo = document.getElementById('interactiveModeInfo');
    
    if (interactiveModeBtn) {
      if (this.isInteractiveMode) {
        interactiveModeBtn.textContent = '🎯 Disable Interactive Mode';
        interactiveModeBtn.classList.add('active');
      } else {
        interactiveModeBtn.textContent = '🎯 Enable Interactive Mode';
        interactiveModeBtn.classList.remove('active');
      }
    }
    
    if (interactiveModeInfo) {
      if (this.isInteractiveMode) {
        interactiveModeInfo.classList.remove('hidden');
        interactiveModeInfo.classList.add('active');
      } else {
        interactiveModeInfo.classList.add('hidden');
        interactiveModeInfo.classList.remove('active');
      }
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
      this.updateAnalysisDisplay(null);
      
    } catch (error) {
      console.error('Failed to stop analysis:', error);
      this.showError('Failed to stop analysis');
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
      this.showError('Failed to show panel');
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
      this.showError('Failed to export report');
    }
  }

  async saveApiSettings() {
    try {
      const apiKeyInput = document.getElementById('apiKeyInput');
      const modelSelect = document.getElementById('modelSelect');
      
      if (!apiKeyInput) {
        this.showError('API key input not found');
        return;
      }
      
      const apiKey = apiKeyInput.value.trim();
      const model = modelSelect ? modelSelect.value : 'gemini-2.5-flash';
      
      if (!apiKey) {
        this.showError('Please enter a valid API key');
        return;
      }
      
      if (apiKey.length < 20) {
        this.showError('API key appears to be too short. Please check your key.');
        return;
      }
      
      // Update background service with new settings
      await chrome.runtime.sendMessage({
        action: 'updateApiSettings',
        data: {
          apiKey: apiKey,
          selectedModel: model
        }
      });
      
      // Save to storage
      await chrome.storage.local.set({ 
        geminiApiKey: apiKey,
        selectedModel: model
      });
      
      this.apiKey = apiKey;
      this.selectedModel = model;
      
      this.showSuccess('API settings saved successfully!');
      this.updateUI();
      
    } catch (error) {
      console.error('Failed to save API settings:', error);
      this.showError('Failed to save API settings: ' + error.message);
    }
  }

  async testApiConnection() {
    if (!this.apiKey) {
      const apiKeyInput = document.getElementById('apiKeyInput');
      if (apiKeyInput && apiKeyInput.value.trim()) {
        this.apiKey = apiKeyInput.value.trim();
      } else {
        this.showError('Please enter an API key first');
        return;
      }
    }
    
    try {
      this.setTesting(true);
      
      const response = await chrome.runtime.sendMessage({
        action: 'testApiConnection'
      });
      
      if (response && response.success) {
        this.showSuccess(`API connection successful! Model: ${response.model || this.selectedModel}`);
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

  async toggleSetting(key, toggleElement) {
    const isActive = toggleElement.classList.contains('active');
    const newValue = !isActive;
    
    this.settings[key] = newValue;
    
    if (newValue) {
      toggleElement.classList.add('active');
    } else {
      toggleElement.classList.remove('active');
    }
    
    try {
      await chrome.storage.local.set({ xclvSettings: this.settings });
      
      // Send to content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      await chrome.tabs.sendMessage(tab.id, {
        action: 'updateSettings',
        data: { [key]: newValue }
      });
      
    } catch (error) {
      console.error('Failed to update setting:', error);
      // Revert toggle state on error
      if (newValue) {
        toggleElement.classList.remove('active');
      } else {
        toggleElement.classList.add('active');
      }
      this.settings[key] = !newValue;
    }
  }

  async updateSetting(key, value) {
    this.settings[key] = value;
    
    try {
      await chrome.storage.local.set({ xclvSettings: this.settings });
      
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
      
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  updateAnalysisDisplay(data) {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const overallScore = document.getElementById('overallScore');
    const brandPreview = document.getElementById('brandPreview');
    const previewContent = document.getElementById('previewContent');
    const primaryArchetype = document.getElementById('primaryArchetype');
    
    if (statusIndicator && statusText) {
      if (this.isAnalyzing) {
        statusIndicator.className = 'status-indicator active';
        statusText.textContent = 'Analysis Active';
      } else {
        statusIndicator.className = 'status-indicator inactive';
        statusText.textContent = 'Analysis Inactive';
      }
    }
    
    if (data) {
      // Update overall score
      if (overallScore && data.tone && data.tone.scores) {
        const scores = Object.values(data.tone.scores);
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        overallScore.textContent = avgScore;
      }
      
      // Update brand preview
      if (brandPreview && previewContent) {
        brandPreview.classList.remove('hidden');
        
        let content = '';
        if (data.tone && data.tone.dominantTone) {
          content += `Tone: ${data.tone.dominantTone}\n`;
        }
        if (data.tone && data.tone.brandPersonality) {
          content += `Personality: ${data.tone.brandPersonality}`;
        }
        
        previewContent.textContent = content || 'Analysis completed';
      }
      
      // Update primary archetype
      if (primaryArchetype && data.archetypes && data.archetypes.primaryArchetype) {
        primaryArchetype.textContent = data.archetypes.primaryArchetype.name;
      }
    } else {
      // Clear data
      if (overallScore) overallScore.textContent = '--';
      if (brandPreview) brandPreview.classList.add('hidden');
      if (primaryArchetype) primaryArchetype.textContent = 'Unknown';
    }
    
    this.updateButtonStates();
  }

  setAnalyzing(analyzing) {
    this.isAnalyzing = analyzing;
    this.updateButtonStates();
  }

  setTesting(testing) {
    const testApiBtn = document.getElementById('testApiBtn');
    if (testApiBtn) {
      testApiBtn.disabled = testing;
      testApiBtn.textContent = testing ? 'Testing...' : 'Test';
    }
  }

  updateButtonStates() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const togglePanelBtn = document.getElementById('togglePanelBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    if (analyzeBtn) {
      if (!this.apiKey) {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Configure API First';
      } else if (this.isAnalyzing) {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Stop Analysis';
      } else {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Start Analysis';
      }
    }
    
    if (togglePanelBtn) {
      togglePanelBtn.disabled = !this.analysisData;
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
    const notification = document.getElementById('notification');
    
    if (notification) {
      notification.textContent = message;
      notification.className = `notification ${type} show`;
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    } else {
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
