// XCLV Brand Analysis - Complete Content Script with Floating Panel
// Professional UI with analysis panel, interactive mode, and debugging

class BrandAnalysisPanel {
  constructor() {
    this.panel = null;
    this.isVisible = false;
    this.isAnalyzing = false;
    this.currentAnalysis = null;
    this.settings = {
      tovAnalysis: true,
      messageClarityAnalysis: true,
      brandArchetypesAnalysis: true
    };
  }

  create() {
    if (this.panel) {
      this.show();
      return;
    }

    try {
      this.injectPanelStyles();
      
      const panel = document.createElement('div');
      panel.className = 'xclv-analysis-panel';
      panel.innerHTML = this.buildPanelHTML();
      
      document.body.appendChild(panel);
      this.panel = panel;
      
      this.setupPanelEventHandlers();
      this.show();
      
      console.log('XCLV: Analysis panel created successfully');
    } catch (error) {
      console.error('XCLV: Failed to create analysis panel:', error);
    }
  }

  buildPanelHTML() {
    return `
      <div class="panel-header">
        <div class="panel-title">
          <span class="panel-icon">🎯</span>
          <h3>XCLV Brand Analysis</h3>
        </div>
        <div class="panel-controls">
          <button class="minimize-btn" title="Minimize">−</button>
          <button class="close-btn" title="Close">×</button>
        </div>
      </div>
      
      <div class="panel-content">
        <div class="analysis-settings">
          <h4>Analysis Types</h4>
          <div class="settings-grid">
            <label class="setting-item">
              <input type="checkbox" id="tov-analysis" checked>
              <span class="checkmark"></span>
              <div class="setting-info">
                <span class="setting-title">Tone of Voice</span>
                <span class="setting-desc">Formality, warmth, authority analysis</span>
              </div>
            </label>
            
            <label class="setting-item">
              <input type="checkbox" id="clarity-analysis" checked>
              <span class="checkmark"></span>
              <div class="setting-info">
                <span class="setting-title">Message Clarity</span>
                <span class="setting-desc">Communication effectiveness scoring</span>
              </div>
            </label>
            
            <label class="setting-item">
              <input type="checkbox" id="archetype-analysis" checked>
              <span class="checkmark"></span>
              <div class="setting-info">
                <span class="setting-title">Brand Archetypes</span>
                <span class="setting-desc">12 core archetypes identification</span>
              </div>
            </label>
          </div>
        </div>

        <div class="analysis-actions">
          <button class="analyze-btn primary" id="panel-analyze-btn">
            <span class="btn-icon">🔍</span>
            <span class="btn-text">Analyze Page</span>
          </button>
          <button class="clear-btn secondary" id="panel-clear-btn">
            <span class="btn-icon">🗑️</span>
            <span class="btn-text">Clear Results</span>
          </button>
        </div>

        <div class="analysis-results" id="panel-results" style="display: none;">
          <h4>Analysis Results</h4>
          <div class="results-content">
            <!-- Results will be populated here -->
          </div>
        </div>

        <div class="analysis-loading" id="panel-loading" style="display: none;">
          <div class="loading-spinner"></div>
          <span class="loading-text">Analyzing brand content...</span>
        </div>
      </div>

      <div class="panel-footer">
        <div class="panel-stats">
          <span class="stats-item">Ready for analysis</span>
        </div>
        <div class="panel-actions">
          <button class="export-btn" id="panel-export-btn" title="Export Report">📄</button>
          <button class="settings-btn" id="panel-settings-btn" title="Settings">⚙️</button>
        </div>
      </div>
    `;
  }

  injectPanelStyles() {
    if (document.getElementById('xclv-panel-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'xclv-panel-styles';
    styles.textContent = `
      .xclv-analysis-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 380px;
        max-height: 80vh;
        background: #ffffff;
        border: 2px solid #2563eb;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(37, 99, 235, 0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        overflow: hidden;
        backdrop-filter: blur(20px);
        animation: xclv-panel-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes xclv-panel-appear {
        0% { 
          opacity: 0; 
          transform: translateX(100%) scale(0.8); 
        }
        100% { 
          opacity: 1; 
          transform: translateX(0) scale(1); 
        }
      }

      .xclv-analysis-panel.minimized {
        height: 60px;
        overflow: hidden;
      }

      .xclv-analysis-panel.minimized .panel-content,
      .xclv-analysis-panel.minimized .panel-footer {
        display: none;
      }

      .panel-header {
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        color: white;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
      }

      .panel-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .panel-icon {
        font-size: 18px;
      }

      .panel-title h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .panel-controls {
        display: flex;
        gap: 4px;
      }

      .panel-controls button {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        transition: background-color 0.2s ease;
      }

      .panel-controls button:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .panel-content {
        padding: 20px;
        max-height: calc(80vh - 140px);
        overflow-y: auto;
      }

      .analysis-settings h4 {
        margin: 0 0 16px 0;
        color: #1f2937;
        font-size: 16px;
        font-weight: 600;
      }

      .settings-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 24px;
      }

      .setting-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: #f9fafb;
      }

      .setting-item:hover {
        border-color: #2563eb;
        background: #eff6ff;
      }

      .setting-item input[type="checkbox"] {
        display: none;
      }

      .checkmark {
        width: 20px;
        height: 20px;
        border: 2px solid #d1d5db;
        border-radius: 4px;
        position: relative;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .setting-item input[type="checkbox"]:checked + .checkmark {
        background: #2563eb;
        border-color: #2563eb;
      }

      .setting-item input[type="checkbox"]:checked + .checkmark::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 12px;
        font-weight: bold;
      }

      .setting-info {
        flex: 1;
      }

      .setting-title {
        display: block;
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 2px;
      }

      .setting-desc {
        display: block;
        font-size: 12px;
        color: #6b7280;
      }

      .analysis-actions {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
      }

      .analyze-btn {
        flex: 1;
        background: linear-gradient(135deg, #059669, #10b981);
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
      }

      .analyze-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #047857, #059669);
        transform: translateY(-1px);
      }

      .analyze-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .clear-btn {
        background: #f3f4f6;
        color: #6b7280;
        border: 1px solid #d1d5db;
        padding: 12px 16px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }

      .clear-btn:hover {
        background: #e5e7eb;
        color: #4b5563;
      }

      .analysis-results {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        background: #f9fafb;
      }

      .analysis-results h4 {
        margin: 0 0 12px 0;
        color: #1f2937;
        font-size: 14px;
        font-weight: 600;
      }

      .analysis-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 24px;
        color: #6b7280;
      }

      .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #e5e7eb;
        border-top: 2px solid #2563eb;
        border-radius: 50%;
        animation: xclv-spin 1s linear infinite;
      }

      @keyframes xclv-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .panel-footer {
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        padding: 12px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .stats-item {
        font-size: 12px;
        color: #6b7280;
      }

      .panel-actions {
        display: flex;
        gap: 8px;
      }

      .export-btn, .settings-btn {
        background: none;
        border: 1px solid #d1d5db;
        color: #6b7280;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .export-btn:hover, .settings-btn:hover {
        border-color: #2563eb;
        color: #2563eb;
        background: #eff6ff;
      }

      /* Results styling */
      .results-content {
        font-size: 13px;
        line-height: 1.5;
      }

      .result-section {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e5e7eb;
      }

      .result-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .result-title {
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .result-score {
        background: #2563eb;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      }

      .result-text {
        color: #4b5563;
        margin-bottom: 4px;
      }

      .result-recommendations {
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 6px;
        padding: 8px;
        margin-top: 8px;
      }

      .result-recommendations .rec-title {
        font-weight: 500;
        color: #92400e;
        font-size: 12px;
        margin-bottom: 4px;
      }

      .result-recommendations .rec-text {
        color: #78350f;
        font-size: 11px;
      }
    `;

    document.head.appendChild(styles);
  }

  setupPanelEventHandlers() {
    if (!this.panel) return;

    try {
      // Close button
      const closeBtn = this.panel.querySelector('.close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hide());
      }

      // Minimize button
      const minimizeBtn = this.panel.querySelector('.minimize-btn');
      if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => this.toggleMinimize());
      }

      // Analyze button
      const analyzeBtn = this.panel.querySelector('#panel-analyze-btn');
      if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => this.startAnalysis());
      }

      // Clear button
      const clearBtn = this.panel.querySelector('#panel-clear-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => this.clearResults());
      }

      // Export button
      const exportBtn = this.panel.querySelector('#panel-export-btn');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => this.exportResults());
      }

      // Settings checkboxes
      const checkboxes = this.panel.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => this.updateSettings(e.target));
      });

      // Make panel draggable
      this.makePanelDraggable();

    } catch (error) {
      console.error('XCLV: Failed to setup panel event handlers:', error);
    }
  }

  makePanelDraggable() {
    const header = this.panel.querySelector('.panel-header');
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.panel-controls')) return;
      
      isDragging = true;
      initialX = e.clientX - this.panel.offsetLeft;
      initialY = e.clientY - this.panel.offsetTop;
      header.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      // Keep panel within viewport
      const maxX = window.innerWidth - this.panel.offsetWidth;
      const maxY = window.innerHeight - this.panel.offsetHeight;
      
      currentX = Math.max(0, Math.min(currentX, maxX));
      currentY = Math.max(0, Math.min(currentY, maxY));

      this.panel.style.left = `${currentX}px`;
      this.panel.style.top = `${currentY}px`;
      this.panel.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      header.style.cursor = 'move';
    });
  }

  show() {
    if (this.panel) {
      this.panel.style.display = 'block';
      this.isVisible = true;
    }
  }

  hide() {
    if (this.panel) {
      this.panel.style.display = 'none';
      this.isVisible = false;
    }
  }

  toggleMinimize() {
    if (this.panel) {
      this.panel.classList.toggle('minimized');
    }
  }

  updateSettings(checkbox) {
    const id = checkbox.id;
    const checked = checkbox.checked;

    switch (id) {
      case 'tov-analysis':
        this.settings.tovAnalysis = checked;
        break;
      case 'clarity-analysis':
        this.settings.messageClarityAnalysis = checked;
        break;
      case 'archetype-analysis':
        this.settings.brandArchetypesAnalysis = checked;
        break;
    }

    console.log('XCLV: Panel settings updated:', this.settings);
  }

  async startAnalysis() {
    if (this.isAnalyzing) return;

    try {
      this.isAnalyzing = true;
      this.showLoading();
      this.updateAnalyzeButton(true);

      // Get page content
      const content = this.extractPageContent();
      
      // Prepare analysis request based on selected checkboxes
      const analysisTypes = [];
      if (this.settings.tovAnalysis) analysisTypes.push('tone-of-voice');
      if (this.settings.messageClarityAnalysis) analysisTypes.push('message-clarity');
      if (this.settings.brandArchetypesAnalysis) analysisTypes.push('brand-archetypes');

      if (analysisTypes.length === 0) {
        throw new Error('Please select at least one analysis type');
      }

      // Send analysis request
      const response = await this.sendMessageSafely({
        action: 'analyzeContent',
        data: {
          text: content.mainContent,
          url: window.location.href,
          metadata: content.metadata,
          analysisTypes: analysisTypes
        }
      });

      if (response && response.success) {
        this.currentAnalysis = response.data;
        this.displayResults(response.data);
        this.updateStats('Analysis completed successfully');
      } else {
        throw new Error(response?.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('XCLV: Panel analysis failed:', error);
      this.showError(error.message);
      this.updateStats('Analysis failed');
    } finally {
      this.isAnalyzing = false;
      this.hideLoading();
      this.updateAnalyzeButton(false);
    }
  }

  extractPageContent() {
    // Use the existing extractor logic
    if (window.xclvController && window.xclvController.extractor) {
      return window.xclvController.extractor.extractPageContent();
    }

    // Fallback content extraction
    const mainContent = document.body.innerText.substring(0, 2000);
    return {
      mainContent,
      metadata: {
        title: document.title,
        url: window.location.href,
        domain: window.location.hostname
      }
    };
  }

  displayResults(data) {
    const resultsContainer = this.panel.querySelector('#panel-results');
    const resultsContent = this.panel.querySelector('.results-content');

    if (!resultsContainer || !resultsContent) return;

    let html = '';

    // Tone of Voice Results
    if (this.settings.tovAnalysis && data.tone_analysis) {
      html += this.buildToneResultsHTML(data.tone_analysis);
    }

    // Message Clarity Results
    if (this.settings.messageClarityAnalysis && data.clarity_analysis) {
      html += this.buildClarityResultsHTML(data.clarity_analysis);
    }

    // Brand Archetypes Results
    if (this.settings.brandArchetypesAnalysis && data.archetype_analysis) {
      html += this.buildArchetypeResultsHTML(data.archetype_analysis);
    }

    resultsContent.innerHTML = html || '<p>No results available</p>';
    resultsContainer.style.display = 'block';
  }

  buildToneResultsHTML(toneData) {
    return `
      <div class="result-section">
        <div class="result-title">
          🎭 Tone of Voice
          <span class="result-score">${toneData.overall_score || 'N/A'}/100</span>
        </div>
        <div class="result-text">${toneData.brand_personality || 'Brand personality analysis'}</div>
        ${toneData.recommendations ? `
          <div class="result-recommendations">
            <div class="rec-title">Recommendations:</div>
            <div class="rec-text">${Array.isArray(toneData.recommendations) ? toneData.recommendations.join('. ') : toneData.recommendations}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  buildClarityResultsHTML(clarityData) {
    return `
      <div class="result-section">
        <div class="result-title">
          💡 Message Clarity
          <span class="result-score">${clarityData.clarity_score || 'N/A'}/100</span>
        </div>
        <div class="result-text">${clarityData.clarity_assessment || 'Message clarity evaluation'}</div>
        ${clarityData.improvement_suggestions ? `
          <div class="result-recommendations">
            <div class="rec-title">Improvements:</div>
            <div class="rec-text">${Array.isArray(clarityData.improvement_suggestions) ? clarityData.improvement_suggestions.join('. ') : clarityData.improvement_suggestions}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  buildArchetypeResultsHTML(archetypeData) {
    return `
      <div class="result-section">
        <div class="result-title">
          🏛️ Brand Archetype
          <span class="result-score">${archetypeData.primary_archetype?.confidence || 'N/A'}%</span>
        </div>
        <div class="result-text">
          <strong>Primary:</strong> ${archetypeData.primary_archetype?.name || 'Unknown'}<br>
          ${archetypeData.secondary_archetype ? `<strong>Secondary:</strong> ${archetypeData.secondary_archetype.name}` : ''}
        </div>
        ${archetypeData.brand_evolution_recommendation ? `
          <div class="result-recommendations">
            <div class="rec-title">Brand Evolution:</div>
            <div class="rec-text">${archetypeData.brand_evolution_recommendation}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  showLoading() {
    const loading = this.panel.querySelector('#panel-loading');
    const results = this.panel.querySelector('#panel-results');
    
    if (loading) loading.style.display = 'flex';
    if (results) results.style.display = 'none';
  }

  hideLoading() {
    const loading = this.panel.querySelector('#panel-loading');
    if (loading) loading.style.display = 'none';
  }

  showError(message) {
    const resultsContainer = this.panel.querySelector('#panel-results');
    const resultsContent = this.panel.querySelector('.results-content');

    if (resultsContainer && resultsContent) {
      resultsContent.innerHTML = `
        <div class="result-section">
          <div class="result-title" style="color: #dc2626;">❌ Error</div>
          <div class="result-text" style="color: #dc2626;">${message}</div>
        </div>
      `;
      resultsContainer.style.display = 'block';
    }
  }

  updateAnalyzeButton(isAnalyzing) {
    const btn = this.panel.querySelector('#panel-analyze-btn');
    if (!btn) return;

    if (isAnalyzing) {
      btn.disabled = true;
      btn.querySelector('.btn-text').textContent = 'Analyzing...';
      btn.querySelector('.btn-icon').textContent = '⏳';
    } else {
      btn.disabled = false;
      btn.querySelector('.btn-text').textContent = 'Analyze Page';
      btn.querySelector('.btn-icon').textContent = '🔍';
    }
  }

  updateStats(message) {
    const statsItem = this.panel.querySelector('.stats-item');
    if (statsItem) {
      statsItem.textContent = message;
    }
  }

  clearResults() {
    const results = this.panel.querySelector('#panel-results');
    if (results) {
      results.style.display = 'none';
    }
    this.currentAnalysis = null;
    this.updateStats('Ready for analysis');
  }

  exportResults() {
    if (!this.currentAnalysis) {
      alert('No analysis data to export. Please run an analysis first.');
      return;
    }

    try {
      const report = this.generateReport(this.currentAnalysis);
      const blob = new Blob([report], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `xclv-analysis-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.updateStats('Report exported successfully');
    } catch (error) {
      console.error('XCLV: Export failed:', error);
      this.updateStats('Export failed');
    }
  }

  generateReport(data) {
    return `# XCLV Brand Analysis Report

**Website:** ${window.location.href}
**Analysis Date:** ${new Date().toLocaleDateString()}
**Analysis Types:** ${Object.entries(this.settings).filter(([key, value]) => value).map(([key]) => key).join(', ')}

## Results Summary

${this.settings.tovAnalysis && data.tone_analysis ? `
### Tone of Voice Analysis
- **Overall Score:** ${data.tone_analysis.overall_score || 'N/A'}/100
- **Brand Personality:** ${data.tone_analysis.brand_personality || 'N/A'}
- **Recommendations:** ${Array.isArray(data.tone_analysis.recommendations) ? data.tone_analysis.recommendations.join('. ') : data.tone_analysis.recommendations || 'N/A'}
` : ''}

${this.settings.messageClarityAnalysis && data.clarity_analysis ? `
### Message Clarity Analysis
- **Clarity Score:** ${data.clarity_analysis.clarity_score || 'N/A'}/100
- **Assessment:** ${data.clarity_analysis.clarity_assessment || 'N/A'}
- **Improvements:** ${Array.isArray(data.clarity_analysis.improvement_suggestions) ? data.clarity_analysis.improvement_suggestions.join('. ') : data.clarity_analysis.improvement_suggestions || 'N/A'}
` : ''}

${this.settings.brandArchetypesAnalysis && data.archetype_analysis ? `
### Brand Archetype Analysis
- **Primary Archetype:** ${data.archetype_analysis.primary_archetype?.name || 'N/A'} (${data.archetype_analysis.primary_archetype?.confidence || 'N/A'}% confidence)
- **Secondary Archetype:** ${data.archetype_analysis.secondary_archetype?.name || 'N/A'}
- **Brand Evolution:** ${data.archetype_analysis.brand_evolution_recommendation || 'N/A'}
` : ''}

---
*Generated by XCLV Brand Intelligence Extension v1.2.8*
`;
  }

  async sendMessageSafely(message) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response || {});
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  destroy() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
      this.isVisible = false;
    }

    // Remove panel styles
    const styles = document.getElementById('xclv-panel-styles');
    if (styles) {
      styles.remove();
    }
  }
}

class InteractiveContentAnalyzer {
  // Keep all existing interactive analyzer code...
  constructor() {
    this.isHoverMode = false;
    this.currentHighlight = null;
    this.analyzeButton = null;
    this.debugPopup = null;
    this.lastAnalyzedElement = null;
    this.animationId = null;
    this.isInitialized = false;
  }

  enable() {
    try {
      this.isHoverMode = true;
      this.setupMouseListeners();
      this.injectStyles();
      console.log('XCLV: Interactive analysis mode enabled');
    } catch (error) {
      console.error('XCLV: Failed to enable interactive mode:', error);
    }
  }

  disable() {
    try {
      this.isHoverMode = false;
      this.removeMouseListeners();
      this.clearHighlight();
      this.hideAnalyzeButton();
      this.closeDebugPopup();
      console.log('XCLV: Interactive analysis mode disabled');
    } catch (error) {
      console.error('XCLV: Failed to disable interactive mode:', error);
    }
  }

  // ... rest of InteractiveContentAnalyzer methods stay the same
}

// WebContentExtractor and main controller classes
class WebContentExtractor {
  constructor() {
    this.isAnalyzing = false;
    this.analysisData = null;
    this.settings = {
      realtimeAnalysis: false,
      hoverInsights: true,
      liveScoreboard: false
    };
  }

  extractPageContent() {
    try {
      return {
        mainContent: this.extractMainContent(),
        headlines: this.extractHeadlines(),
        callToActions: this.extractCTAs(),
        navigation: this.extractNavigation(),
        metadata: this.extractMetadata()
      };
    } catch (error) {
      console.error('XCLV: Error extracting page content:', error);
      return {
        mainContent: '',
        headlines: [],
        callToActions: [],
        navigation: [],
        metadata: {}
      };
    }
  }

  extractMainContent() {
    try {
      const contentSelectors = [
        'main', 'article', '[role="main"]',
        '.content', '.main-content', '#content',
        'p', 'h1', 'h2', 'h3'
      ];
      
      return this.smartContentExtraction(contentSelectors);
    } catch (error) {
      console.error('XCLV: Error extracting main content:', error);
      return '';
    }
  }

  smartContentExtraction(selectors) {
    let content = '';
    
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el && el.textContent && el.textContent.trim().length > 20) {
            if (!this.isUIElement(el)) {
              content += el.textContent.trim() + ' ';
            }
          }
        });
      } catch (error) {
        console.warn(`XCLV: Failed to extract content from selector ${selector}:`, error);
      }
    });
    
    return content.trim();
  }

  isUIElement(element) {
    try {
      const uiIndicators = [
        'cookie', 'popup', 'modal', 'overlay', 'banner',
        'navigation', 'menu', 'header', 'footer', 'sidebar'
      ];
      
      const elementText = (element.textContent || '').toLowerCase();
      const elementClass = (element.className || '').toLowerCase();
      const elementId = (element.id || '').toLowerCase();
      
      return uiIndicators.some(indicator => 
        elementText.includes(indicator) || 
        elementClass.includes(indicator) || 
        elementId.includes(indicator)
      );
    } catch (error) {
      console.warn('XCLV: Error checking UI element:', error);
      return false;
    }
  }

  extractHeadlines() {
    try {
      return Array.from(document.querySelectorAll('h1, h2, h3'))
        .map(el => ({
          text: el.textContent.trim(),
          level: el.tagName.toLowerCase(),
          position: this.getElementPosition(el)
        }))
        .filter(h => h.text.length > 0);
    } catch (error) {
      console.warn('XCLV: Failed to extract headlines:', error);
      return [];
    }
  }

  extractCTAs() {
    try {
      const ctaSelectors = [
        'button', 
        'a[href]',
        '.btn', '.button',
        '.cta', '.call-to-action',
        '[role="button"]'
      ];
      
      const ctas = [];
      ctaSelectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(el => {
            const text = el.textContent.trim();
            if (text.length > 0 && text.length < 100) {
              ctas.push({
                text: text,
                type: el.tagName.toLowerCase(),
                position: this.getElementPosition(el)
              });
            }
          });
        } catch (error) {
          console.warn(`XCLV: Failed to extract CTAs from selector ${selector}:`, error);
        }
      });
      
      return ctas;
    } catch (error) {
      console.warn('XCLV: Failed to extract CTAs:', error);
      return [];
    }
  }

  extractNavigation() {
    try {
      const navigation = [];
      
      const navElements = document.querySelectorAll('nav, .navigation, .menu');
      navElements.forEach(nav => {
        const links = nav.querySelectorAll('a');
        links.forEach(link => {
          const text = link.textContent.trim();
          if (text.length > 0) {
            navigation.push({
              text: text,
              href: link.href || '',
              position: this.getElementPosition(link)
            });
          }
        });
      });
      
      return navigation;
    } catch (error) {
      console.warn('XCLV: Failed to extract navigation:', error);
      return [];
    }
  }

  extractMetadata() {
    try {
      const title = document.title || '';
      const description = document.querySelector('meta[name="description"]')?.content || '';
      const keywords = document.querySelector('meta[name="keywords"]')?.content || '';
      
      return {
        title,
        description,
        keywords,
        url: window.location.href,
        domain: window.location.hostname
      };
    } catch (error) {
      console.warn('XCLV: Failed to extract metadata:', error);
      return {
        title: '',
        description: '',
        keywords: '',
        url: window.location.href,
        domain: window.location.hostname
      };
    }
  }

  getElementPosition(element) {
    try {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      };
    } catch (error) {
      return { top: 0, left: 0, width: 0, height: 0 };
    }
  }
}

// Enhanced XCLVContentController with panel support
class XCLVContentController {
  constructor() {
    this.extractor = new WebContentExtractor();
    this.interactiveAnalyzer = new InteractiveContentAnalyzer();
    this.analysisPanel = new BrandAnalysisPanel();
    this.isAnalyzing = false;
    this.isInitialized = false;
  }

  initialize() {
    try {
      if (this.isInitialized) {
        console.log('XCLV: Already initialized');
        return;
      }
      
      this.setupMessageListener();
      this.isInitialized = true;
      console.log('XCLV: Brand Analysis content script initialized');
    } catch (error) {
      console.error('XCLV: Failed to initialize:', error);
    }
  }

  setupMessageListener() {
    try {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        this.handleMessage(request, sender, sendResponse);
        return true; // Keep message channel open for async response
      });
    } catch (error) {
      console.error('XCLV: Failed to setup message listener:', error);
    }
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      console.log('XCLV: Received message:', request.action);
      
      switch (request.action) {
        case 'startAnalysis':
          const result = await this.startAnalysis();
          sendResponse(result);
          break;
          
        case 'stopAnalysis':
          this.stopAnalysis();
          sendResponse({ success: true });
          break;
          
        case 'showPanel':
          this.showAnalysisPanel();
          sendResponse({ success: true, message: 'Analysis panel displayed' });
          break;
          
        case 'hidePanel':
          this.hideAnalysisPanel();
          sendResponse({ success: true, message: 'Analysis panel hidden' });
          break;
          
        case 'toggleAnalysis':
          if (this.isAnalyzing) {
            this.stopAnalysis();
          } else {
            await this.startAnalysis();
          }
          sendResponse({ success: true });
          break;
          
        case 'enableInteractiveMode':
          this.interactiveAnalyzer.enable();
          sendResponse({ success: true });
          break;
          
        case 'disableInteractiveMode':
          this.interactiveAnalyzer.disable();
          sendResponse({ success: true });
          break;
          
        case 'getStatus':
          sendResponse({
            isActive: this.isAnalyzing,
            data: this.extractor.analysisData
          });
          break;
          
        case 'getAnalysisData':
          sendResponse({
            data: this.extractor.analysisData
          });
          break;
          
        case 'updateSettings':
          this.updateSettings(request.data);
          sendResponse({ success: true });
          break;
          
        default:
          console.warn('XCLV: Unknown action:', request.action);
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('XCLV: Message handler error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  showAnalysisPanel() {
    try {
      this.analysisPanel.create();
      console.log('XCLV: Analysis panel shown');
    } catch (error) {
      console.error('XCLV: Failed to show analysis panel:', error);
    }
  }

  hideAnalysisPanel() {
    try {
      this.analysisPanel.hide();
      console.log('XCLV: Analysis panel hidden');
    } catch (error) {
      console.error('XCLV: Failed to hide analysis panel:', error);
    }
  }

  async startAnalysis() {
    try {
      this.isAnalyzing = true;
      
      const content = this.extractor.extractPageContent();
      const mainText = content.mainContent;
      
      console.log('XCLV: Extracted content length:', mainText.length);
      
      if (!mainText || mainText.length < 50) {
        throw new Error('Insufficient content for analysis');
      }
      
      const response = await this.sendMessageSafely({
        action: 'analyzeContent',
        data: {
          text: mainText,
          url: window.location.href,
          metadata: content.metadata
        }
      });
      
      console.log('XCLV: Background response:', response);
      
      if (response && response.success) {
        this.extractor.analysisData = response.data;
        return { success: true, data: response.data };
      } else {
        throw new Error(response?.error || 'Analysis failed');
      }
      
    } catch (error) {
      console.error('XCLV: Analysis failed:', error);
      this.isAnalyzing = false;
      return { success: false, error: error.message };
    }
  }

  stopAnalysis() {
    try {
      this.isAnalyzing = false;
      this.extractor.analysisData = null;
    } catch (error) {
      console.error('XCLV: Error stopping analysis:', error);
    }
  }

  updateSettings(settings) {
    try {
      if (!settings) return;
      
      this.extractor.settings = { ...this.extractor.settings, ...settings };
      console.log('XCLV: Settings updated:', this.extractor.settings);
    } catch (error) {
      console.error('XCLV: Error updating settings:', error);
    }
  }

  async sendMessageSafely(message) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response || {});
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Safe initialization with multiple fallbacks
function initializeXCLV() {
  try {
    if (window.xclvController) {
      console.log('XCLV: Already initialized');
      return;
    }

    // Check if we're in a valid document context
    if (!document || !document.documentElement) {
      console.log('XCLV: Document not ready, retrying...');
      setTimeout(initializeXCLV, 100);
      return;
    }

    window.xclvController = new XCLVContentController();
    window.xclvController.initialize();
    console.log('XCLV: Content Controller initialized successfully');
  } catch (error) {
    console.error('XCLV: Failed to initialize Content Controller:', error);
    // Retry once after a delay
    setTimeout(() => {
      try {
        if (!window.xclvController) {
          window.xclvController = new XCLVContentController();
          window.xclvController.initialize();
        }
      } catch (retryError) {
        console.error('XCLV: Retry initialization failed:', retryError);
      }
    }, 1000);
  }
}

// Multiple initialization strategies
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeXCLV);
} else {
  // Document already loaded
  setTimeout(initializeXCLV, 100);
}

// Handle SPA navigation with error handling
if (window.MutationObserver) {
  try {
    const observer = new MutationObserver((mutations) => {
      try {
        const hasSignificantChanges = mutations.some(mutation => 
          mutation.type === 'childList' && mutation.addedNodes.length > 0
        );
        
        if (hasSignificantChanges && !window.xclvController) {
          setTimeout(initializeXCLV, 500);
        }
      } catch (error) {
        console.error('XCLV: Mutation observer error:', error);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } catch (error) {
    console.error('XCLV: Failed to setup mutation observer:', error);
  }
}

// Global error handler to prevent extension breakage
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('xclv')) {
    console.error('XCLV: Global error caught:', event.error);
    event.preventDefault();
  }
}, true);