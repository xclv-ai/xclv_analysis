// XCLV Brand Analysis Extension - Content Script
// Complete Interactive Functionality Restoration v1.2.12

console.log('XCLV: Content script loading...');

// Content Extractor Class
class ContentExtractor {
  constructor() {
    this.analysisData = null;
    this.settings = {
      enableInteractive: true,
      analysisDepth: 'balanced',
      showInlineResults: true
    };
  }

  extractPageContent() {
    try {
      const content = {
        mainContent: this.extractMainContent(),
        headlines: this.extractHeadlines(),
        metadata: this.extractMetadata(),
        textElements: this.extractTextElements()
      };
      
      console.log('XCLV: Page content extracted:', {
        mainContentLength: content.mainContent.length,
        headlinesCount: content.headlines.length,
        textElementsCount: content.textElements.length
      });
      
      return content;
    } catch (error) {
      console.error('XCLV: Content extraction failed:', error);
      return { mainContent: '', headlines: [], metadata: {}, textElements: [] };
    }
  }

  extractMainContent() {
    const contentSelectors = [
      'main', 'article', '[role="main"]',
      '.content', '.main-content', '#content',
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ];

    let content = '';
    
    for (const selector of contentSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (element.textContent && element.textContent.trim().length > 20) {
          content += element.textContent.trim() + ' ';
        }
      }
      if (content.length > 500) break; // Sufficient content found
    }

    return content.trim() || document.body.textContent.trim();
  }

  extractHeadlines() {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(el => ({
        text: el.textContent.trim(),
        level: el.tagName.toLowerCase(),
        element: el
      }))
      .filter(h => h.text.length > 0);
  }

  extractMetadata() {
    return {
      title: document.title,
      url: window.location.href,
      description: document.querySelector('meta[name="description"]')?.content || '',
      keywords: document.querySelector('meta[name="keywords"]')?.content || '',
      ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
      timestamp: new Date().toISOString()
    };
  }

  extractTextElements() {
    const textSelectors = 'p, h1, h2, h3, h4, h5, h6, span, div, a, button, li';
    return Array.from(document.querySelectorAll(textSelectors))
      .filter(el => {
        const text = el.textContent.trim();
        return text.length >= 10 && text.length <= 500 && this.isVisibleElement(el);
      })
      .map(el => ({
        element: el,
        text: el.textContent.trim(),
        tag: el.tagName.toLowerCase(),
        selector: this.getElementSelector(el)
      }));
  }

  isVisibleElement(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }

  getElementSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }
}

// Analysis Panel Class
class AnalysisPanel {
  constructor() {
    this.panel = null;
    this.isDragging = false;
    this.isVisible = false;
    this.position = { x: 20, y: 20 };
  }

  create() {
    if (this.panel) {
      this.show();
      return;
    }

    try {
      this.panel = document.createElement('div');
      this.panel.id = 'xclv-analysis-panel';
      this.panel.className = 'xclv-analysis-panel';
      this.panel.innerHTML = this.buildPanelHTML();
      
      // Set initial position
      this.panel.style.left = `${this.position.x}px`;
      this.panel.style.top = `${this.position.y}px`;
      
      document.body.appendChild(this.panel);
      this.setupEventListeners();
      this.isVisible = true;
      
      console.log('XCLV: Analysis panel created');
    } catch (error) {
      console.error('XCLV: Failed to create analysis panel:', error);
    }
  }

  buildPanelHTML() {
    return `
      <div class="xclv-panel-header">
        <div class="xclv-panel-title">
          <span class="xclv-brand-icon">🎯</span>
          XCLV Brand Intelligence
        </div>
        <div class="xclv-panel-controls">
          <button class="xclv-btn-minimize" title="Minimize">−</button>
          <button class="xclv-btn-close" title="Close">×</button>
        </div>
      </div>
      
      <div class="xclv-panel-content">
        <div class="xclv-analysis-status">
          <div class="xclv-status-indicator">
            <span class="xclv-status-dot"></span>
            <span class="xclv-status-text">Ready for Analysis</span>
          </div>
        </div>
        
        <div class="xclv-analysis-controls">
          <button class="xclv-analyze-btn" id="xclv-analyze-page">
            🔍 Analyze Page
          </button>
          <button class="xclv-panel-btn" id="xclv-show-results">
            📊 Show Analysis Panel
          </button>
        </div>
        
        <div class="xclv-interactive-section">
          <h4>Interactive Mode</h4>
          <label class="xclv-toggle-container">
            <input type="checkbox" id="xclv-enable-hover" checked>
            <span class="xclv-toggle-slider"></span>
            <span class="xclv-toggle-label">✨ Enable Hover Analysis</span>
          </label>
          <label class="xclv-toggle-container">
            <input type="checkbox" id="xclv-disable-interactive">
            <span class="xclv-toggle-slider"></span>
            <span class="xclv-toggle-label">❌ Disable Interactive</span>
          </label>
        </div>
        
        <div class="xclv-settings-section">
          <h4>Settings</h4>
          <label class="xclv-checkbox-container">
            <input type="checkbox" id="xclv-hover-insights" checked>
            <span class="xclv-checkbox-label">Hover Insights</span>
          </label>
        </div>
        
        <div class="xclv-api-section">
          <h4>⚙️ API Settings</h4>
          <p class="xclv-api-note">Configure in extension options</p>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    if (!this.panel) return;

    // Header dragging
    const header = this.panel.querySelector('.xclv-panel-header');
    if (header) {
      header.addEventListener('mousedown', this.startDragging.bind(this));
    }

    // Control buttons
    const closeBtn = this.panel.querySelector('.xclv-btn-close');
    const minimizeBtn = this.panel.querySelector('.xclv-btn-minimize');
    const analyzeBtn = this.panel.querySelector('#xclv-analyze-page');
    const showResultsBtn = this.panel.querySelector('#xclv-show-results');

    if (closeBtn) closeBtn.addEventListener('click', () => this.hide());
    if (minimizeBtn) minimizeBtn.addEventListener('click', () => this.minimize());
    if (analyzeBtn) analyzeBtn.addEventListener('click', () => this.triggerPageAnalysis());
    if (showResultsBtn) showResultsBtn.addEventListener('click', () => this.showResultsPanel());

    // Interactive mode toggles
    const enableHover = this.panel.querySelector('#xclv-enable-hover');
    const disableInteractive = this.panel.querySelector('#xclv-disable-interactive');

    if (enableHover) {
      enableHover.addEventListener('change', (e) => {
        if (e.target.checked) {
          window.xclvController?.enableInteractiveMode();
          if (disableInteractive) disableInteractive.checked = false;
        }
      });
    }

    if (disableInteractive) {
      disableInteractive.addEventListener('change', (e) => {
        if (e.target.checked) {
          window.xclvController?.disableInteractiveMode();
          if (enableHover) enableHover.checked = false;
        }
      });
    }

    // Global mouse events for dragging
    document.addEventListener('mousemove', this.handleDragging.bind(this));
    document.addEventListener('mouseup', this.stopDragging.bind(this));
  }

  startDragging(e) {
    this.isDragging = true;
    this.dragOffset = {
      x: e.clientX - this.panel.offsetLeft,
      y: e.clientY - this.panel.offsetTop
    };
    this.panel.style.cursor = 'grabbing';
    e.preventDefault();
  }

  handleDragging(e) {
    if (!this.isDragging || !this.panel) return;

    const newX = e.clientX - this.dragOffset.x;
    const newY = e.clientY - this.dragOffset.y;

    // Keep within viewport bounds
    const maxX = window.innerWidth - this.panel.offsetWidth;
    const maxY = window.innerHeight - this.panel.offsetHeight;

    this.position.x = Math.max(0, Math.min(newX, maxX));
    this.position.y = Math.max(0, Math.min(newY, maxY));

    this.panel.style.left = `${this.position.x}px`;
    this.panel.style.top = `${this.position.y}px`;
  }

  stopDragging() {
    this.isDragging = false;
    if (this.panel) {
      this.panel.style.cursor = 'grab';
    }
  }

  triggerPageAnalysis() {
    try {
      window.xclvController?.startAnalysis();
      this.updateStatus('Analyzing...', 'analyzing');
    } catch (error) {
      console.error('XCLV: Failed to trigger analysis:', error);
      this.updateStatus('Analysis Failed', 'error');
    }
  }

  showResultsPanel() {
    try {
      // Trigger popup to show results panel
      chrome.runtime.sendMessage({ action: 'showPanel' });
    } catch (error) {
      console.error('XCLV: Failed to show results panel:', error);
    }
  }

  updateStatus(text, state = 'ready') {
    const statusText = this.panel?.querySelector('.xclv-status-text');
    const statusDot = this.panel?.querySelector('.xclv-status-dot');
    
    if (statusText) statusText.textContent = text;
    if (statusDot) {
      statusDot.className = `xclv-status-dot xclv-status-${state}`;
    }
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

  minimize() {
    if (this.panel) {
      this.panel.classList.toggle('xclv-minimized');
    }
  }

  destroy() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
      this.isVisible = false;
    }
  }
}

// Interactive Content Analyzer Class - CORE HOVER FUNCTIONALITY
class InteractiveContentAnalyzer {
  constructor() {
    this.isHoverMode = false;
    this.currentHoveredElement = null;
    this.analyzeButton = null;
    this.analysisOverlay = null;
    this.analysisCache = new Map();
    this.isAnalyzing = false;
    
    console.log('XCLV: InteractiveContentAnalyzer initialized');
  }

  enable() {
    if (this.isHoverMode) return;
    
    this.isHoverMode = true;
    this.setupMouseEvents();
    this.showModeNotification('Interactive mode enabled - hover over text elements');
    console.log('XCLV: Interactive hover mode ENABLED');
  }

  disable() {
    if (!this.isHoverMode) return;
    
    this.isHoverMode = false;
    this.removeMouseEvents();
    this.cleanup();
    this.showModeNotification('Interactive mode disabled');
    console.log('XCLV: Interactive hover mode DISABLED');
  }

  setupMouseEvents() {
    // Remove existing listeners first
    this.removeMouseEvents();
    
    // Add new listeners
    document.addEventListener('mouseover', this.handleMouseOver.bind(this), true);
    document.addEventListener('mouseout', this.handleMouseOut.bind(this), true);
    document.addEventListener('click', this.handleClick.bind(this), true);
    
    console.log('XCLV: Mouse event listeners attached');
  }

  removeMouseEvents() {
    document.removeEventListener('mouseover', this.handleMouseOver.bind(this), true);
    document.removeEventListener('mouseout', this.handleMouseOut.bind(this), true);
    document.removeEventListener('click', this.handleClick.bind(this), true);
  }

  handleMouseOver(event) {
    if (!this.isHoverMode || this.isAnalyzing) return;

    const element = event.target;
    
    // Skip if hovering over XCLV elements
    if (this.isXCLVElement(element)) return;
    
    // Check if element is analyzable
    if (this.isAnalyzableElement(element)) {
      this.highlightElement(element);
      this.showAnalyzeButton(element, event);
      this.currentHoveredElement = element;
    }
  }

  handleMouseOut(event) {
    if (!this.isHoverMode || this.isAnalyzing) return;

    const element = event.target;
    const relatedTarget = event.relatedTarget;
    
    // Don't remove highlight if moving to analyze button
    if (relatedTarget && (
      relatedTarget.classList?.contains('xclv-analyze-btn-inline') ||
      relatedTarget.closest('.xclv-analyze-btn-inline')
    )) {
      return;
    }

    if (element === this.currentHoveredElement) {
      this.removeHighlight(element);
      this.hideAnalyzeButton();
      this.currentHoveredElement = null;
    }
  }

  handleClick(event) {
    // Handle analyze button clicks
    if (event.target.classList?.contains('xclv-analyze-btn-inline')) {
      event.preventDefault();
      event.stopPropagation();
      this.analyzeElement(this.currentHoveredElement);
      return;
    }
  }

  isXCLVElement(element) {
    return element.closest('#xclv-analysis-panel') ||
           element.closest('.xclv-analyze-btn-inline') ||
           element.closest('.xclv-analysis-overlay') ||
           element.classList?.contains('xclv-highlighted') ||
           element.id?.startsWith('xclv-');
  }

  isAnalyzableElement(element) {
    // Check tag types
    const analyzableTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'a', 'button', 'li'];
    if (!analyzableTags.includes(element.tagName.toLowerCase())) return false;

    // Check text content
    const text = element.textContent?.trim();
    if (!text || text.length < 10 || text.length > 500) return false;

    // Check visibility
    if (!this.isElementVisible(element)) return false;

    // Skip if already highlighted
    if (element.classList.contains('xclv-highlighted')) return false;

    return true;
  }

  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return rect.width > 0 && 
           rect.height > 0 && 
           style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  highlightElement(element) {
    element.classList.add('xclv-highlighted');
    element.style.filter = 'blur(1px)';
    element.style.transition = 'filter 0.2s ease';
  }

  removeHighlight(element) {
    if (element) {
      element.classList.remove('xclv-highlighted');
      element.style.filter = '';
      element.style.transition = '';
    }
  }

  showAnalyzeButton(element, event) {
    this.hideAnalyzeButton(); // Remove any existing button

    const rect = element.getBoundingClientRect();
    
    this.analyzeButton = document.createElement('button');
    this.analyzeButton.className = 'xclv-analyze-btn-inline';
    this.analyzeButton.innerHTML = '🔍 Analyze Content';
    this.analyzeButton.title = 'Click to analyze this text element';
    
    // Position the button
    this.analyzeButton.style.position = 'fixed';
    this.analyzeButton.style.left = `${rect.left + window.scrollX}px`;
    this.analyzeButton.style.top = `${rect.bottom + window.scrollY + 5}px`;
    this.analyzeButton.style.zIndex = '999999';
    
    document.body.appendChild(this.analyzeButton);
  }

  hideAnalyzeButton() {
    if (this.analyzeButton) {
      this.analyzeButton.remove();
      this.analyzeButton = null;
    }
  }

  async analyzeElement(element) {
    if (!element || this.isAnalyzing) return;

    try {
      this.isAnalyzing = true;
      const text = element.textContent.trim();
      
      // Check cache first
      if (this.analysisCache.has(text)) {
        this.showAnalysisResult(element, this.analysisCache.get(text));
        this.isAnalyzing = false;
        return;
      }

      // Show loading state
      this.showAnalysisOverlay(element, { loading: true });

      // Send analysis request
      const response = await this.sendAnalysisRequest(text, element);
      
      if (response && response.success) {
        this.analysisCache.set(text, response.data);
        this.showAnalysisResult(element, response.data);
      } else {
        throw new Error(response?.error || 'Analysis failed');
      }
      
    } catch (error) {
      console.error('XCLV: Element analysis failed:', error);
      this.showAnalysisResult(element, { error: error.message });
    } finally {
      this.isAnalyzing = false;
    }
  }

  async sendAnalysisRequest(text, element) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({
          action: 'analyzeContent',
          data: {
            text: text,
            elementType: element.tagName.toLowerCase(),
            context: this.getElementContext(element),
            url: window.location.href
          }
        }, (response) => {
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

  getElementContext(element) {
    return {
      tagName: element.tagName.toLowerCase(),
      className: element.className,
      id: element.id,
      parent: element.parentElement?.tagName.toLowerCase(),
      siblings: element.parentElement?.children.length || 0
    };
  }

  showAnalysisOverlay(element, data) {
    this.hideAnalysisOverlay();

    const rect = element.getBoundingClientRect();
    
    this.analysisOverlay = document.createElement('div');
    this.analysisOverlay.className = 'xclv-analysis-overlay';
    
    if (data.loading) {
      this.analysisOverlay.innerHTML = `
        <div class="xclv-overlay-content">
          <div class="xclv-loading">
            <div class="xclv-spinner"></div>
            <span>Analyzing...</span>
          </div>
        </div>
      `;
    }
    
    // Position overlay
    this.analysisOverlay.style.position = 'fixed';
    this.analysisOverlay.style.left = `${rect.left + window.scrollX}px`;
    this.analysisOverlay.style.top = `${rect.bottom + window.scrollY + 10}px`;
    this.analysisOverlay.style.zIndex = '1000000';
    
    document.body.appendChild(this.analysisOverlay);
  }

  showAnalysisResult(element, data) {
    this.hideAnalysisOverlay();

    if (data.error) {
      this.showErrorResult(element, data.error);
      return;
    }

    const rect = element.getBoundingClientRect();
    
    this.analysisOverlay = document.createElement('div');
    this.analysisOverlay.className = 'xclv-analysis-overlay xclv-result-overlay';
    this.analysisOverlay.innerHTML = this.buildResultHTML(data);
    
    // Position overlay
    this.analysisOverlay.style.position = 'fixed';
    this.analysisOverlay.style.left = `${rect.left + window.scrollX}px`;
    this.analysisOverlay.style.top = `${rect.bottom + window.scrollY + 10}px`;
    this.analysisOverlay.style.zIndex = '1000000';
    
    document.body.appendChild(this.analysisOverlay);
    
    // Auto-hide after 5 seconds
    setTimeout(() => this.hideAnalysisOverlay(), 5000);
    
    // Add click-to-close
    this.analysisOverlay.addEventListener('click', () => this.hideAnalysisOverlay());
  }

  buildResultHTML(data) {
    const analysis = data.analysis || {};
    const scores = analysis.scores || {};
    
    return `
      <div class="xclv-overlay-content">
        <div class="xclv-result-header">
          <h4>📊 Brand Analysis</h4>
          <button class="xclv-close-overlay">×</button>
        </div>
        
        <div class="xclv-result-scores">
          <div class="xclv-score-item">
            <span class="xclv-score-label">Clarity:</span>
            <span class="xclv-score-value">${scores.clarity || 'N/A'}</span>
          </div>
          <div class="xclv-score-item">
            <span class="xclv-score-label">Tone:</span>
            <span class="xclv-score-value">${scores.tone || 'N/A'}</span>
          </div>
          <div class="xclv-score-item">
            <span class="xclv-score-label">Impact:</span>
            <span class="xclv-score-value">${scores.impact || 'N/A'}</span>
          </div>
        </div>
        
        ${analysis.summary ? `
          <div class="xclv-result-summary">
            <p>${analysis.summary}</p>
          </div>
        ` : ''}
        
        <div class="xclv-result-footer">
          <small>Click to close • Auto-closes in 5s</small>
        </div>
      </div>
    `;
  }

  showErrorResult(element, error) {
    const rect = element.getBoundingClientRect();
    
    this.analysisOverlay = document.createElement('div');
    this.analysisOverlay.className = 'xclv-analysis-overlay xclv-error-overlay';
    this.analysisOverlay.innerHTML = `
      <div class="xclv-overlay-content">
        <div class="xclv-error-content">
          <span class="xclv-error-icon">⚠️</span>
          <span class="xclv-error-text">Analysis failed: ${error}</span>
        </div>
      </div>
    `;
    
    this.analysisOverlay.style.position = 'fixed';
    this.analysisOverlay.style.left = `${rect.left + window.scrollX}px`;
    this.analysisOverlay.style.top = `${rect.bottom + window.scrollY + 10}px`;
    this.analysisOverlay.style.zIndex = '1000000';
    
    document.body.appendChild(this.analysisOverlay);
    
    // Auto-hide error after 3 seconds
    setTimeout(() => this.hideAnalysisOverlay(), 3000);
  }

  hideAnalysisOverlay() {
    if (this.analysisOverlay) {
      this.analysisOverlay.remove();
      this.analysisOverlay = null;
    }
  }

  showModeNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'xclv-mode-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000001;
      animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  cleanup() {
    this.hideAnalyzeButton();
    this.hideAnalysisOverlay();
    
    if (this.currentHoveredElement) {
      this.removeHighlight(this.currentHoveredElement);
      this.currentHoveredElement = null;
    }
    
    // Remove any remaining highlights
    document.querySelectorAll('.xclv-highlighted').forEach(el => {
      this.removeHighlight(el);
    });
  }
}

// Main Content Controller Class
class XCLVContentController {
  constructor() {
    this.extractor = new ContentExtractor();
    this.analysisPanel = new AnalysisPanel();
    this.interactiveAnalyzer = new InteractiveContentAnalyzer();
    this.isAnalyzing = false;
    
    console.log('XCLV: Content Controller created');
  }

  initialize() {
    try {
      this.setupMessageListener();
      console.log('XCLV: Content Controller initialized successfully');
    } catch (error) {
      console.error('XCLV: Failed to initialize Content Controller:', error);
    }
  }

  enableInteractiveMode() {
    this.interactiveAnalyzer.enable();
  }

  disableInteractiveMode() {
    this.interactiveAnalyzer.disable();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      console.log('XCLV: Received message:', request.action);
      
      switch (request.action) {
        case 'showPanel':
          this.showAnalysisPanel();
          sendResponse({ success: true, message: 'Analysis panel shown' });
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
          sendResponse({ success: true, message: 'Interactive mode activated - hover over text elements' });
          break;
          
        case 'disableInteractiveMode':
          this.interactiveAnalyzer.disable();
          sendResponse({ success: true, message: 'Interactive mode deactivated' });
          break;
          
        case 'getStatus':
          sendResponse({
            isActive: this.isAnalyzing,
            data: this.extractor.analysisData,
            interactiveMode: this.interactiveAnalyzer.isHoverMode
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