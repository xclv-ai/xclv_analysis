// XCLV Brand Analysis - Content Script
// Page Interaction and Real-time Analysis

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
      'p', 'h1', 'h2', 'h3'
    ];
    
    return this.smartContentExtraction(contentSelectors);
  }

  smartContentExtraction(selectors) {
    let content = '';
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.textContent && el.textContent.trim().length > 20) {
          content += el.textContent.trim() + ' ';
        }
      });
    });
    
    return content.trim();
  }

  extractHeadlines() {
    return Array.from(document.querySelectorAll('h1, h2, h3'))
      .map(el => ({
        text: el.textContent.trim(),
        level: el.tagName.toLowerCase(),
        position: this.getElementPosition(el)
      }))
      .filter(h => h.text.length > 0);
  }

  extractCTAs() {
    const ctaSelectors = [
      'button', 
      'a[href]',
      '.btn', '.button',
      '.cta', '.call-to-action',
      '[role="button"]'
    ];
    
    const ctas = [];
    ctaSelectors.forEach(selector => {
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
    });
    
    return ctas;
  }

  extractNavigation() {
    const navElements = document.querySelectorAll('nav, .navigation, .menu');
    const navigation = [];
    
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
  }

  extractMetadata() {
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
  }

  getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height
    };
  }
}

class BrandAnalysisUI {
  constructor() {
    this.panel = null;
    this.isVisible = false;
    this.extractor = new WebContentExtractor();
  }

  createAnalysisPanel() {
    if (this.panel) {
      this.panel.remove();
    }

    const panel = document.createElement('div');
    panel.className = 'xclv-analysis-panel';
    panel.innerHTML = `
      <div class="xclv-panel-header">
        <h3>XCLV Brand Analysis</h3>
        <button class="xclv-close-btn">×</button>
      </div>
      
      <div class="xclv-analysis-tabs">
        <button class="xclv-tab active" data-tab="overview">Overview</button>
        <button class="xclv-tab" data-tab="tone">Tone</button>
        <button class="xclv-tab" data-tab="archetypes">Archetypes</button>
      </div>
      
      <div class="xclv-analysis-content">
        <div class="xclv-tab-content active" id="xclv-overview-content">
          <div class="xclv-loading">Analyzing brand elements...</div>
        </div>
        <div class="xclv-tab-content" id="xclv-tone-content">
          <div class="xclv-loading">Analyzing tone of voice...</div>
        </div>
        <div class="xclv-tab-content" id="xclv-archetypes-content">
          <div class="xclv-loading">Analyzing brand archetypes...</div>
        </div>
      </div>
    `;

    this.panel = panel;
    this.setupPanelEvents();
    document.body.appendChild(panel);
    
    return panel;
  }

  setupPanelEvents() {
    // Close button
    this.panel.querySelector('.xclv-close-btn').addEventListener('click', () => {
      this.hidePanel();
    });

    // Tab switching
    this.panel.querySelectorAll('.xclv-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Make panel draggable
    this.makeDraggable();
  }

  switchTab(tabName) {
    // Update active tab
    this.panel.querySelectorAll('.xclv-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    this.panel.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update active content
    this.panel.querySelectorAll('.xclv-tab-content').forEach(content => {
      content.classList.remove('active');
    });
    this.panel.querySelector(`#xclv-${tabName}-content`).classList.add('active');
  }

  makeDraggable() {
    const header = this.panel.querySelector('.xclv-panel-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('xclv-close-btn')) return;
      
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

      this.panel.style.left = currentX + 'px';
      this.panel.style.top = currentY + 'px';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      header.style.cursor = 'grab';
    });
  }

  showPanel() {
    if (!this.panel) {
      this.createAnalysisPanel();
    }
    this.panel.style.display = 'block';
    this.isVisible = true;
  }

  hidePanel() {
    if (this.panel) {
      this.panel.style.display = 'none';
    }
    this.isVisible = false;
  }

  updateAnalysisResults(data) {
    if (!this.panel) return;

    // Update Overview
    const overviewContent = this.panel.querySelector('#xclv-overview-content');
    overviewContent.innerHTML = this.buildOverviewHTML(data);

    // Update Tone
    const toneContent = this.panel.querySelector('#xclv-tone-content');
    toneContent.innerHTML = this.buildToneHTML(data.tone);

    // Update Archetypes
    const archetypesContent = this.panel.querySelector('#xclv-archetypes-content');
    archetypesContent.innerHTML = this.buildArchetypesHTML(data.archetypes);
  }

  buildOverviewHTML(data) {
    const overallScore = this.calculateOverallScore(data);
    return `
      <div class="xclv-overview-score">
        <div class="xclv-score-circle">
          <span class="xclv-score-number">${overallScore}</span>
          <span class="xclv-score-label">Brand Score</span>
        </div>
      </div>
      
      <div class="xclv-quick-insights">
        <h4>Key Insights</h4>
        <ul>
          <li>Dominant Tone: ${data.tone?.dominantTone || 'Unknown'}</li>
          <li>Primary Archetype: ${data.archetypes?.primaryArchetype?.name || 'Unknown'}</li>
          <li>Brand Personality: ${data.tone?.brandPersonality || 'Unknown'}</li>
        </ul>
      </div>
    `;
  }

  buildToneHTML(toneData) {
    if (!toneData || !toneData.scores) {
      return '<div class="xclv-error">Tone analysis not available</div>';
    }

    const scores = toneData.scores;
    return `
      <div class="xclv-tone-scores">
        ${Object.entries(scores).map(([dimension, score]) => `
          <div class="xclv-tone-metric">
            <label>${this.capitalizeFirst(dimension)}</label>
            <div class="xclv-meter">
              <div class="xclv-meter-fill" style="width: ${score}%"></div>
            </div>
            <span class="xclv-score">${score}</span>
          </div>
        `).join('')}
      </div>
      
      <div class="xclv-tone-insights">
        <h4>Recommendations</h4>
        <ul>
          ${(toneData.recommendations || []).map(rec => 
            `<li><strong>${rec.area}:</strong> ${rec.insight}</li>`
          ).join('')}
        </ul>
      </div>
    `;
  }

  buildArchetypesHTML(archetypeData) {
    if (!archetypeData || !archetypeData.primaryArchetype) {
      return '<div class="xclv-error">Archetype analysis not available</div>';
    }

    const primary = archetypeData.primaryArchetype;
    const secondary = archetypeData.secondaryArchetype;

    return `
      <div class="xclv-archetypes-primary">
        <h4>Primary Archetype</h4>
        <div class="xclv-archetype-card">
          <div class="xclv-archetype-name">${primary.name}</div>
          <div class="xclv-archetype-score">${primary.score}%</div>
          <div class="xclv-archetype-evidence">
            ${(primary.evidence || []).map(evidence => 
              `<span class="xclv-evidence">${evidence}</span>`
            ).join('')}
          </div>
        </div>
      </div>
      
      ${secondary ? `
        <div class="xclv-archetypes-secondary">
          <h4>Secondary Archetype</h4>
          <div class="xclv-archetype-card">
            <div class="xclv-archetype-name">${secondary.name}</div>
            <div class="xclv-archetype-score">${secondary.score}%</div>
          </div>
        </div>
      ` : ''}
      
      <div class="xclv-archetype-recommendations">
        <h4>Strategic Recommendations</h4>
        <ul>
          ${(archetypeData.recommendations || []).map(rec => 
            `<li><strong>${rec.archetype}:</strong> ${rec.rationale}</li>`
          ).join('')}
        </ul>
      </div>
    `;
  }

  calculateOverallScore(data) {
    if (!data || !data.tone || !data.tone.scores) return 0;
    
    const toneScores = Object.values(data.tone.scores);
    const avg = toneScores.reduce((a, b) => a + b, 0) / toneScores.length;
    return Math.round(avg);
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

class TextAnalysisOverlay {
  constructor() {
    this.activeOverlay = null;
    this.analysisCache = new Map();
    this.isEnabled = true;
  }

  setupMouseoverAnalysis() {
    const textSelectors = 'p, h1, h2, h3, h4, h5, h6, span, div, a, button';
    
    document.addEventListener('mouseover', (e) => {
      if (!this.isEnabled || !this.shouldAnalyzeElement(e.target)) return;
      this.showAnalysisOverlay(e.target, e);
    });

    document.addEventListener('mouseout', (e) => {
      if (this.activeOverlay && !this.activeOverlay.contains(e.relatedTarget)) {
        this.hideAnalysisOverlay();
      }
    });
  }

  shouldAnalyzeElement(element) {
    const text = element.textContent?.trim() || '';
    
    // Skip if text too short or too long
    if (text.length < 10 || text.length > 200) return false;
    
    // Skip if element is part of XCLV UI
    if (element.closest('.xclv-analysis-panel, .xclv-overlay')) return false;
    
    // Skip script, style, and other non-content elements
    const tagName = element.tagName.toLowerCase();
    if (['script', 'style', 'meta', 'link'].includes(tagName)) return false;
    
    return true;
  }

  async showAnalysisOverlay(element, event) {
    const text = element.textContent.trim();
    
    // Check cache first
    let analysis = this.analysisCache.get(text);
    if (!analysis) {
      // Mock analysis for now - in real implementation, this would call the background script
      analysis = this.getMockAnalysis(text);
      this.analysisCache.set(text, analysis);
    }

    this.createOverlay(element, analysis, event);
  }

  getMockAnalysis(text) {
    // Mock analysis - replace with actual API call
    const clarityScore = Math.floor(Math.random() * 40) + 60; // 60-100
    return {
      clarityScore,
      comprehensionLevel: clarityScore > 80 ? 'immediate' : clarityScore > 60 ? 'quick' : 'slow',
      actionPotential: clarityScore > 75 ? 'high' : 'medium',
      quickInsights: [
        {
          type: clarityScore > 70 ? 'positive' : 'improvement',
          message: clarityScore > 70 ? 'Clear and effective messaging' : 'Could be more direct'
        }
      ]
    };
  }

  createOverlay(element, analysis, event) {
    this.hideAnalysisOverlay();

    const overlay = document.createElement('div');
    overlay.className = 'xclv-text-analysis-overlay';
    overlay.innerHTML = `
      <div class="xclv-clarity-score">
        <span class="xclv-score-value">${analysis.clarityScore}</span>
        <span class="xclv-score-label">Clarity</span>
      </div>
      <div class="xclv-quick-insights">
        ${analysis.quickInsights.map(insight => 
          `<div class="xclv-insight xclv-${insight.type}">${insight.message}</div>`
        ).join('')}
      </div>
    `;

    // Position the overlay
    const rect = element.getBoundingClientRect();
    overlay.style.position = 'absolute';
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.top = `${rect.bottom + window.scrollY + 5}px`;
    overlay.style.zIndex = '10000';

    document.body.appendChild(overlay);
    this.activeOverlay = overlay;

    // Auto-hide after 3 seconds
    setTimeout(() => this.hideAnalysisOverlay(), 3000);
  }

  hideAnalysisOverlay() {
    if (this.activeOverlay) {
      this.activeOverlay.remove();
      this.activeOverlay = null;
    }
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.hideAnalysisOverlay();
    }
  }
}

// Main Content Script Controller
class XCLVContentController {
  constructor() {
    this.extractor = new WebContentExtractor();
    this.ui = new BrandAnalysisUI();
    this.overlay = new TextAnalysisOverlay();
    this.isAnalyzing = false;
  }

  initialize() {
    this.setupMessageListener();
    this.overlay.setupMouseoverAnalysis();
    console.log('XCLV Brand Analysis content script initialized');
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'startAnalysis':
          this.startAnalysis().then(sendResponse);
          return true;
          
        case 'stopAnalysis':
          this.stopAnalysis();
          sendResponse({ success: true });
          break;
          
        case 'showPanel':
          this.ui.showPanel();
          sendResponse({ success: true });
          break;
          
        case 'hidePanel':
          this.ui.hidePanel();
          sendResponse({ success: true });
          break;
          
        case 'toggleAnalysis':
          if (this.isAnalyzing) {
            this.stopAnalysis();
          } else {
            this.startAnalysis();
          }
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
      }
    });
  }

  async startAnalysis() {
    try {
      this.isAnalyzing = true;
      
      // Extract page content
      const content = this.extractor.extractPageContent();
      const mainText = content.mainContent;
      
      if (!mainText || mainText.length < 50) {
        throw new Error('Insufficient content for analysis');
      }
      
      // Send to background script for AI analysis
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: 'analyzeContent',
          data: {
            text: mainText,
            url: window.location.href,
            metadata: content.metadata
          }
        }, resolve);
      });
      
      if (response && response.success) {
        this.extractor.analysisData = response.data;
        this.ui.updateAnalysisResults(response.data);
        return { success: true, data: response.data };
      } else {
        throw new Error(response?.error || 'Analysis failed');
      }
      
    } catch (error) {
      console.error('Analysis failed:', error);
      this.isAnalyzing = false;
      return { success: false, error: error.message };
    }
  }

  stopAnalysis() {
    this.isAnalyzing = false;
    this.ui.hidePanel();
    this.extractor.analysisData = null;
  }

  updateSettings(settings) {
    this.extractor.settings = { ...this.extractor.settings, ...settings };
    
    // Apply settings
    if (settings.hasOwnProperty('hoverInsights')) {
      this.overlay.setEnabled(settings.hoverInsights);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const controller = new XCLVContentController();
    controller.initialize();
  });
} else {
  const controller = new XCLVContentController();
  controller.initialize();
}