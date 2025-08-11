// XCLV Brand Analysis - Content Script
// Real-time webpage analysis and UI overlay system

class WebContentExtractor {
  extractPageContent() {
    return {
      mainContent: this.extractMainContent(),
      headlines: this.extractHeadlines(),
      callToActions: this.extractCTAs(),
      navigation: this.extractNavigation(),
      metadata: this.extractMetadata()
    };
  }

  extractMainContent() {
    const contentSelectors = [
      'main', 'article', '[role="main"]',
      '.content', '.main-content', '#content',
      '.post-content', '.entry-content',
      'p', 'div'
    ];
    
    let content = '';
    for (const selector of contentSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.textContent.trim().length > 50) {
          content += el.textContent.trim() + ' ';
        }
      });
      if (content.length > 500) break; // Sufficient content found
    }
    
    return content.slice(0, 2000); // Limit for API efficiency
  }

  extractHeadlines() {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(el => ({
        text: el.textContent.trim(),
        level: el.tagName.toLowerCase(),
        element: el
      }))
      .filter(h => h.text.length > 3);
  }

  extractCTAs() {
    const ctaSelectors = [
      'button', 'a[href]', '.cta', '.btn', 
      '[class*="button"]', '[class*="cta"]',
      'input[type="submit"]', '.call-to-action'
    ];
    
    return Array.from(document.querySelectorAll(ctaSelectors.join(', ')))
      .map(el => el.textContent.trim())
      .filter(text => text.length > 2 && text.length < 100);
  }

  extractNavigation() {
    const navSelectors = ['nav', '.navigation', '.nav', '.menu', 'header a'];
    const navItems = [];
    
    navSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        const text = el.textContent.trim();
        if (text.length > 2 && text.length < 50) {
          navItems.push(text);
        }
      });
    });
    
    return [...new Set(navItems)]; // Remove duplicates
  }

  extractMetadata() {
    return {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || '',
      url: window.location.href,
      domain: window.location.hostname
    };
  }
}

class TextAnalysisOverlay {
  constructor() {
    this.activeOverlay = null;
    this.analysisCache = new Map();
    this.isEnabled = false;
    this.pendingAnalysis = new Set();
  }

  enable() {
    this.isEnabled = true;
    this.setupMouseoverAnalysis();
  }

  disable() {
    this.isEnabled = false;
    this.hideAnalysisOverlay();
    this.removeEventListeners();
  }

  setupMouseoverAnalysis() {
    if (this.mouseoverHandler) {
      document.removeEventListener('mouseover', this.mouseoverHandler);
    }
    if (this.mouseoutHandler) {
      document.removeEventListener('mouseout', this.mouseoutHandler);
    }

    this.mouseoverHandler = this.handleMouseover.bind(this);
    this.mouseoutHandler = this.handleMouseout.bind(this);

    document.addEventListener('mouseover', this.mouseoverHandler);
    document.addEventListener('mouseout', this.mouseoutHandler);
  }

  removeEventListeners() {
    if (this.mouseoverHandler) {
      document.removeEventListener('mouseover', this.mouseoverHandler);
    }
    if (this.mouseoutHandler) {
      document.removeEventListener('mouseout', this.mouseoutHandler);
    }
  }

  handleMouseover(e) {
    if (!this.isEnabled || !this.shouldAnalyzeElement(e.target)) return;
    
    // Debounce rapid mouseovers
    if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
    this.hoverTimeout = setTimeout(() => {
      this.showAnalysisOverlay(e.target, e);
    }, 300);
  }

  handleMouseout(e) {
    if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
    
    if (this.activeOverlay && !this.activeOverlay.contains(e.relatedTarget)) {
      this.hideAnalysisOverlay();
    }
  }

  shouldAnalyzeElement(element) {
    // Skip if overlay or extension elements
    if (element.closest('.xclv-analysis-overlay, .xclv-analysis-panel')) {
      return false;
    }

    const text = element.textContent?.trim();
    if (!text || text.length < 10 || text.length > 500) return false;

    // Only analyze text-containing elements
    const textElements = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'DIV', 'A', 'BUTTON'];
    return textElements.includes(element.tagName);
  }

  async showAnalysisOverlay(element, event) {
    const text = element.textContent.trim();
    const cacheKey = this.generateCacheKey(text);

    // Prevent multiple analyses of the same element
    if (this.pendingAnalysis.has(cacheKey)) return;

    // Check cache first
    let analysis = this.analysisCache.get(cacheKey);
    if (!analysis) {
      this.pendingAnalysis.add(cacheKey);
      try {
        analysis = await this.requestClarityAnalysis(text, this.getElementContext(element));
        this.analysisCache.set(cacheKey, analysis);
      } catch (error) {
        console.error('Analysis error:', error);
        return;
      } finally {
        this.pendingAnalysis.delete(cacheKey);
      }
    }

    if (analysis && !analysis.error) {
      this.createOverlay(element, analysis);
    }
  }

  async requestClarityAnalysis(text, context) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'analyzeClarity',
        text: text,
        context: context
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response.error) {
          reject(new Error(response.message));
        } else {
          resolve(response.result);
        }
      });
    });
  }

  getElementContext(element) {
    const parent = element.parentElement;
    const siblings = parent ? Array.from(parent.children).length : 0;
    const tagName = element.tagName.toLowerCase();
    
    return {
      tag: tagName,
      className: element.className,
      parent: parent?.tagName?.toLowerCase() || '',
      siblings: siblings,
      isHeader: /^h[1-6]$/.test(tagName),
      isButton: tagName === 'button' || element.type === 'submit',
      isLink: tagName === 'a'
    };
  }

  createOverlay(element, analysis) {
    this.hideAnalysisOverlay();

    const overlay = document.createElement('div');
    overlay.className = 'xclv-analysis-overlay';
    overlay.innerHTML = `
      <div class="clarity-score ${this.getScoreClass(analysis.clarityScore)}">
        <span class="score-value">${analysis.clarityScore}</span>
        <span class="score-label">Clarity</span>
      </div>
      <div class="quick-insights">
        ${analysis.quickInsights.map(insight => 
          `<div class="insight ${insight.type}">${insight.message}</div>`
        ).join('')}
      </div>
      <div class="effectiveness-badge ${analysis.effectiveness}">
        ${analysis.effectiveness.toUpperCase()}
      </div>
    `;

    this.positionOverlay(overlay, element);
    document.body.appendChild(overlay);
    this.activeOverlay = overlay;

    // Auto-hide after 4 seconds
    this.autoHideTimeout = setTimeout(() => {
      this.hideAnalysisOverlay();
    }, 4000);
  }

  positionOverlay(overlay, element) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const overlayHeight = 120; // Estimated overlay height

    // Position above or below based on available space
    if (rect.top > overlayHeight + 20) {
      // Position above
      overlay.style.top = `${rect.top + window.scrollY - overlayHeight - 10}px`;
      overlay.classList.add('above');
    } else {
      // Position below
      overlay.style.top = `${rect.bottom + window.scrollY + 10}px`;
      overlay.classList.add('below');
    }

    // Center horizontally, but keep within viewport
    const centerX = rect.left + rect.width / 2;
    const overlayWidth = 280;
    let leftPosition = centerX - overlayWidth / 2;
    
    // Ensure overlay stays within viewport
    if (leftPosition < 10) leftPosition = 10;
    if (leftPosition + overlayWidth > window.innerWidth - 10) {
      leftPosition = window.innerWidth - overlayWidth - 10;
    }

    overlay.style.left = `${leftPosition + window.scrollX}px`;
  }

  getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  hideAnalysisOverlay() {
    if (this.activeOverlay) {
      this.activeOverlay.remove();
      this.activeOverlay = null;
    }
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout);
    }
  }

  generateCacheKey(text) {
    return btoa(text.slice(0, 50)).replace(/[^a-zA-Z0-9]/g, '');
  }
}

class BrandAnalysisPanel {
  constructor() {
    this.panel = null;
    this.isVisible = false;
    this.currentAnalysis = null;
    this.isAnalyzing = false;
  }

  create() {
    if (this.panel) return;

    this.panel = document.createElement('div');
    this.panel.className = 'xclv-analysis-panel';
    this.panel.innerHTML = `
      <div class="panel-header">
        <div class="panel-title">
          <div class="xclv-logo">XCLV</div>
          <h3>Brand Analysis</h3>
        </div>
        <div class="panel-controls">
          <button class="minimize-btn" title="Minimize">−</button>
          <button class="close-btn" title="Close">×</button>
        </div>
      </div>
      
      <div class="panel-content">
        <div class="analysis-tabs">
          <button class="tab active" data-tab="overview">Overview</button>
          <button class="tab" data-tab="tone">Tone</button>
          <button class="tab" data-tab="archetypes">Archetypes</button>
        </div>
        
        <div class="tab-content active" id="overview-content">
          ${this.buildOverviewUI()}
        </div>
        <div class="tab-content" id="tone-content">
          ${this.buildToneAnalysisUI()}
        </div>
        <div class="tab-content" id="archetypes-content">
          ${this.buildArchetypeAnalysisUI()}
        </div>
      </div>
      
      <div class="panel-footer">
        <button class="analyze-btn primary" id="analyze-page-btn">
          <span class="btn-text">Analyze Page</span>
          <span class="btn-spinner"></span>
        </button>
        <button class="export-btn secondary" id="export-report-btn" disabled>Export</button>
        <button class="toggle-mouseover-btn secondary" id="toggle-mouseover-btn">
          <span>Live Analysis: <span class="status">OFF</span></span>
        </button>
      </div>
    `;

    this.attachEventListeners();
    document.body.appendChild(this.panel);
  }

  buildOverviewUI() {
    return `
      <div class="overview-section">
        <div class="overall-score">
          <div class="score-circle" data-score="0">
            <span class="score-number">-</span>
            <span class="score-label">Overall</span>
          </div>
        </div>
        
        <div class="metric-grid">
          <div class="metric-card">
            <h4>Brand Consistency</h4>
            <div class="metric-value" data-metric="consistency">-</div>
          </div>
          <div class="metric-card">
            <h4>Message Clarity</h4>
            <div class="metric-value" data-metric="clarity">-</div>
          </div>
          <div class="metric-card">
            <h4>Emotional Resonance</h4>
            <div class="metric-value" data-metric="emotion">-</div>
          </div>
        </div>
        
        <div class="insights-section">
          <h4>Key Insights</h4>
          <div class="insights-list" id="key-insights">
            <p class="placeholder">Run analysis to see insights</p>
          </div>
        </div>
      </div>
    `;
  }

  buildToneAnalysisUI() {
    return `
      <div class="tone-section">
        <div class="tone-metrics">
          <div class="metric-item">
            <h4>Formality</h4>
            <div class="meter">
              <div class="meter-fill" data-metric="formality" data-value="0"></div>
            </div>
            <span class="metric-value">-</span>
          </div>
          
          <div class="metric-item">
            <h4>Warmth</h4>
            <div class="meter">
              <div class="meter-fill" data-metric="warmth" data-value="0"></div>
            </div>
            <span class="metric-value">-</span>
          </div>
          
          <div class="metric-item">
            <h4>Authority</h4>
            <div class="meter">
              <div class="meter-fill" data-metric="authority" data-value="0"></div>
            </div>
            <span class="metric-value">-</span>
          </div>
        </div>
        
        <div class="tone-insights">
          <h4>Tone Analysis</h4>
          <div class="dominant-tone" id="dominant-tone">
            <span class="placeholder">Analyzing...</span>
          </div>
          <div class="tone-recommendations" id="tone-recommendations">
            <ul class="recommendations-list"></ul>
          </div>
        </div>
      </div>
    `;
  }

  buildArchetypeAnalysisUI() {
    return `
      <div class="archetype-section">
        <div class="primary-archetype" id="primary-archetype">
          <h4>Primary Archetype</h4>
          <div class="archetype-badge">
            <span class="archetype-name">-</span>
            <span class="archetype-strength">-</span>
          </div>
        </div>
        
        <div class="archetype-mix" id="archetype-mix">
          <h4>Archetype Mix</h4>
          <div class="archetype-bars"></div>
        </div>
        
        <div class="archetype-personality" id="archetype-personality">
          <h4>Brand Personality</h4>
          <p class="personality-description">-</p>
        </div>
        
        <div class="archetype-recommendations" id="archetype-recommendations">
          <h4>Recommendations</h4>
          <ul class="recommendations-list"></ul>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Tab switching
    this.panel.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    // Panel controls
    this.panel.querySelector('.close-btn').addEventListener('click', () => this.hide());
    this.panel.querySelector('.minimize-btn').addEventListener('click', () => this.minimize());

    // Action buttons
    this.panel.querySelector('#analyze-page-btn').addEventListener('click', () => this.analyzeCurrentPage());
    this.panel.querySelector('#export-report-btn').addEventListener('click', () => this.exportReport());
    this.panel.querySelector('#toggle-mouseover-btn').addEventListener('click', () => this.toggleMouseoverAnalysis());

    // Make panel draggable
    this.makeDraggable();
  }

  switchTab(tabName) {
    // Update tab buttons
    this.panel.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update content
    this.panel.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-content`);
    });
  }

  async analyzeCurrentPage() {
    if (this.isAnalyzing) return;

    this.isAnalyzing = true;
    this.updateAnalyzeButton(true);

    try {
      const contentExtractor = new WebContentExtractor();
      const contentData = contentExtractor.extractPageContent();

      // Perform comprehensive analysis
      const pageAnalysis = await this.requestPageAnalysis(contentData);
      
      if (pageAnalysis && !pageAnalysis.error) {
        this.currentAnalysis = pageAnalysis;
        this.updateUI(pageAnalysis);
        this.enableExport();
      } else {
        this.showError('Analysis failed. Please check your API key and try again.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      this.showError('Unable to analyze page. Please try again.');
    } finally {
      this.isAnalyzing = false;
      this.updateAnalyzeButton(false);
    }
  }

  async requestPageAnalysis(contentData) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'analyzePage',
        contentData: contentData
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response.error) {
          reject(new Error(response.message));
        } else {
          resolve(response.result);
        }
      });
    });
  }

  updateUI(analysis) {
    // Update overview metrics
    this.updateOverallScore(analysis.overallScore);
    this.updateMetricGrid(analysis);
    this.updateInsights(analysis);

    // Update tone analysis
    if (analysis.toneAnalysis) {
      this.updateToneMetrics(analysis.toneAnalysis);
    }

    // Update archetype analysis
    if (analysis.primaryArchetype) {
      this.updateArchetypeUI(analysis);
    }
  }

  updateOverallScore(score) {
    const scoreElement = this.panel.querySelector('.score-number');
    const scoreCircle = this.panel.querySelector('.score-circle');
    
    scoreElement.textContent = score;
    scoreCircle.dataset.score = score;
    scoreCircle.className = `score-circle ${this.getScoreClass(score)}`;
  }

  updateMetricGrid(analysis) {
    const metrics = {
      consistency: analysis.brandConsistency,
      clarity: analysis.messageClarity,
      emotion: analysis.emotionalResonance
    };

    Object.entries(metrics).forEach(([key, value]) => {
      const element = this.panel.querySelector(`[data-metric="${key}"]`);
      if (element) {
        element.textContent = value;
        element.className = `metric-value ${this.getScoreClass(value)}`;
      }
    });
  }

  updateInsights(analysis) {
    const insightsContainer = this.panel.querySelector('#key-insights');
    const insights = [
      ...analysis.strengths.map(s => ({ type: 'strength', text: s })),
      ...analysis.weaknesses.map(w => ({ type: 'weakness', text: w }))
    ];

    insightsContainer.innerHTML = insights.map(insight => 
      `<div class="insight ${insight.type}">${insight.text}</div>`
    ).join('');
  }

  updateToneMetrics(toneAnalysis) {
    Object.entries(toneAnalysis).forEach(([metric, value]) => {
      const meterFill = this.panel.querySelector(`[data-metric="${metric}"]`);
      const valueSpan = meterFill?.parentElement.nextElementSibling;
      
      if (meterFill && valueSpan) {
        meterFill.style.width = `${value}%`;
        meterFill.dataset.value = value;
        valueSpan.textContent = value;
      }
    });
  }

  updateArchetypeUI(analysis) {
    // Update primary archetype
    const archetypeName = this.panel.querySelector('.archetype-name');
    const archetypeStrength = this.panel.querySelector('.archetype-strength');
    
    if (archetypeName && archetypeStrength) {
      archetypeName.textContent = analysis.primaryArchetype.toUpperCase();
      archetypeStrength.textContent = `${analysis.archetypeStrength}%`;
    }

    // Update personality description
    const personalityDesc = this.panel.querySelector('.personality-description');
    if (personalityDesc && analysis.competitivePosition) {
      personalityDesc.textContent = analysis.competitivePosition;
    }
  }

  getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  updateAnalyzeButton(isAnalyzing) {
    const button = this.panel.querySelector('#analyze-page-btn');
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.btn-spinner');

    if (isAnalyzing) {
      button.disabled = true;
      button.classList.add('loading');
      btnText.textContent = 'Analyzing...';
      spinner.style.display = 'inline-block';
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      btnText.textContent = 'Analyze Page';
      spinner.style.display = 'none';
    }
  }

  toggleMouseoverAnalysis() {
    const button = this.panel.querySelector('#toggle-mouseover-btn');
    const status = button.querySelector('.status');
    const isEnabled = textAnalysisOverlay.isEnabled;

    if (isEnabled) {
      textAnalysisOverlay.disable();
      status.textContent = 'OFF';
      button.classList.remove('active');
    } else {
      textAnalysisOverlay.enable();
      status.textContent = 'ON';
      button.classList.add('active');
    }
  }

  enableExport() {
    const exportBtn = this.panel.querySelector('#export-report-btn');
    exportBtn.disabled = false;
  }

  exportReport() {
    if (!this.currentAnalysis) return;

    const reportData = {
      url: window.location.href,
      domain: window.location.hostname,
      timestamp: new Date().toISOString(),
      analysis: this.currentAnalysis
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `brand-analysis-${window.location.hostname}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  show() {
    if (!this.panel) this.create();
    this.panel.classList.add('visible');
    this.isVisible = true;
  }

  hide() {
    if (this.panel) {
      this.panel.classList.remove('visible');
      this.isVisible = false;
    }
  }

  minimize() {
    if (this.panel) {
      this.panel.classList.toggle('minimized');
    }
  }

  makeDraggable() {
    const header = this.panel.querySelector('.panel-header');
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      const rect = this.panel.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      header.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      
      this.panel.style.left = `${Math.max(0, Math.min(x, window.innerWidth - this.panel.offsetWidth))}px`;
      this.panel.style.top = `${Math.max(0, Math.min(y, window.innerHeight - this.panel.offsetHeight))}px`;
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      header.style.cursor = 'grab';
    });
  }

  showError(message) {
    const insightsContainer = this.panel.querySelector('#key-insights');
    insightsContainer.innerHTML = `<div class="error-message">${message}</div>`;
  }
}

// Initialize components
const textAnalysisOverlay = new TextAnalysisOverlay();
const brandAnalysisPanel = new BrandAnalysisPanel();

// Message listener for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'togglePanel':
      if (brandAnalysisPanel.isVisible) {
        brandAnalysisPanel.hide();
      } else {
        brandAnalysisPanel.show();
      }
      sendResponse({ success: true });
      break;

    case 'showPanel':
      brandAnalysisPanel.show();
      sendResponse({ success: true });
      break;

    case 'hidePanel':
      brandAnalysisPanel.hide();
      sendResponse({ success: true });
      break;

    case 'toggleMouseover':
      textAnalysisOverlay.isEnabled ? 
        textAnalysisOverlay.disable() : 
        textAnalysisOverlay.enable();
      sendResponse({ success: true, enabled: textAnalysisOverlay.isEnabled });
      break;

    case 'analyzeCurrentPage':
      brandAnalysisPanel.show();
      brandAnalysisPanel.analyzeCurrentPage();
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: true, message: 'Unknown action' });
  }
});

// Auto-show panel on first load for new users
chrome.storage.sync.get(['hasSeenIntro'], (result) => {
  if (!result.hasSeenIntro) {
    setTimeout(() => {
      brandAnalysisPanel.show();
      chrome.storage.sync.set({ hasSeenIntro: true });
    }, 2000);
  }
});

console.log('XCLV Brand Analysis content script loaded');
