// XCLV Brand Analysis - Enhanced Content Script
// Interactive Content Analysis with Debug Popup

class InteractiveContentAnalyzer {
  constructor() {
    this.isHoverMode = false;
    this.currentHighlight = null;
    this.analyzeButton = null;
    this.debugPopup = null;
    this.lastAnalyzedElement = null;
    this.animationId = null;
  }

  enable() {
    this.isHoverMode = true;
    this.setupMouseListeners();
    this.injectStyles();
    console.log('XCLV: Interactive analysis mode enabled');
  }

  disable() {
    this.isHoverMode = false;
    this.removeMouseListeners();
    this.clearHighlight();
    this.hideAnalyzeButton();
    this.closeDebugPopup();
    console.log('XCLV: Interactive analysis mode disabled');
  }

  injectStyles() {
    if (document.getElementById('xclv-interactive-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'xclv-interactive-styles';
    styles.textContent = `
      .xclv-highlight-frame {
        position: absolute;
        pointer-events: none;
        border: 3px solid #4CAF50;
        border-radius: 8px;
        background: rgba(76, 175, 80, 0.1);
        backdrop-filter: blur(2px);
        box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 9998;
        animation: xclv-pulse 2s infinite;
      }

      @keyframes xclv-pulse {
        0%, 100% { 
          box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
          border-color: #4CAF50;
        }
        50% { 
          box-shadow: 0 6px 30px rgba(76, 175, 80, 0.5);
          border-color: #66BB6A;
        }
      }

      .xclv-analyze-button {
        position: absolute;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
        z-index: 9999;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: xclv-button-appear 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      @keyframes xclv-button-appear {
        0% { 
          opacity: 0; 
          transform: scale(0.5) translateY(10px); 
        }
        100% { 
          opacity: 1; 
          transform: scale(1) translateY(0); 
        }
      }

      .xclv-analyze-button:hover {
        background: linear-gradient(135deg, #45a049, #4CAF50);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
      }

      .xclv-debug-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 800px;
        max-width: 90vw;
        max-height: 80vh;
        background: #1a1a1a;
        color: #e0e0e0;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        overflow: hidden;
        animation: xclv-popup-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .xclv-debug-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        z-index: 9999;
      }

      .xclv-debug-header {
        background: linear-gradient(135deg, #333, #444);
        padding: 20px;
        border-bottom: 1px solid #555;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .xclv-debug-close {
        background: none;
        border: none;
        color: #ccc;
        font-size: 24px;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        transition: all 0.2s ease;
      }

      .xclv-debug-tabs {
        display: flex;
        background: #2a2a2a;
        border-bottom: 1px solid #444;
      }

      .xclv-debug-tab {
        background: none;
        border: none;
        color: #ccc;
        padding: 15px 20px;
        cursor: pointer;
        transition: all 0.2s ease;
        border-bottom: 3px solid transparent;
      }

      .xclv-debug-tab.active {
        color: #4CAF50;
        border-bottom-color: #4CAF50;
        background: rgba(76, 175, 80, 0.1);
      }

      .xclv-debug-content {
        padding: 0;
        max-height: calc(80vh - 160px);
        overflow-y: auto;
      }

      .xclv-debug-section {
        padding: 20px;
        border-bottom: 1px solid #333;
      }

      .xclv-debug-code {
        background: #2a2a2a;
        border: 1px solid #444;
        border-radius: 8px;
        padding: 15px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 13px;
        line-height: 1.5;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .xclv-debug-json {
        background: #1e1e1e;
        border: 1px solid #444;
        border-radius: 8px;
        padding: 15px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 12px;
        line-height: 1.4;
        overflow-x: auto;
        max-height: 300px;
        overflow-y: auto;
      }

      .xclv-debug-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: #999;
      }

      .xclv-spinner {
        border: 3px solid #333;
        border-top: 3px solid #4CAF50;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: xclv-spin 1s linear infinite;
        margin-right: 15px;
      }

      @keyframes xclv-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .xclv-debug-tab-content {
        display: none;
      }

      .xclv-debug-tab-content.active {
        display: block;
      }
    `;
    document.head.appendChild(styles);
  }

  setupMouseListeners() {
    this.mouseOverHandler = this.handleMouseOver.bind(this);
    this.mouseOutHandler = this.handleMouseOut.bind(this);
    
    document.addEventListener('mouseover', this.mouseOverHandler);
    document.addEventListener('mouseout', this.mouseOutHandler);
  }

  removeMouseListeners() {
    if (this.mouseOverHandler) {
      document.removeEventListener('mouseover', this.mouseOverHandler);
    }
    if (this.mouseOutHandler) {
      document.removeEventListener('mouseout', this.mouseOutHandler);
    }
  }

  handleMouseOver(event) {
    if (!this.isHoverMode) return;
    
    const element = event.target;
    if (this.shouldAnalyzeElement(element)) {
      this.highlightElement(element);
      this.showAnalyzeButton(element);
    }
  }

  handleMouseOut(event) {
    if (!this.isHoverMode) return;
    
    const relatedTarget = event.relatedTarget;
    
    if (relatedTarget && (
      relatedTarget.classList.contains('xclv-analyze-button') ||
      relatedTarget.classList.contains('xclv-highlight-frame') ||
      this.currentHighlight?.contains(relatedTarget)
    )) {
      return;
    }
    
    setTimeout(() => {
      if (!this.isMouseOverHighlightArea(event.clientX, event.clientY)) {
        this.clearHighlight();
        this.hideAnalyzeButton();
      }
    }, 100);
  }

  shouldAnalyzeElement(element) {
    if (!element || !element.textContent) return false;
    
    const text = element.textContent.trim();
    
    if (text.length < 20 || text.length > 1000) return false;
    
    if (element.closest('.xclv-analysis-panel, .xclv-debug-popup, .xclv-highlight-frame, .xclv-analyze-button')) {
      return false;
    }
    
    const tagName = element.tagName.toLowerCase();
    if (['script', 'style', 'meta', 'link', 'nav', 'header', 'footer'].includes(tagName)) {
      return false;
    }
    
    const contentElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'article', 'section', 'div'];
    if (!contentElements.includes(tagName)) return false;
    
    return true;
  }

  highlightElement(element) {
    this.clearHighlight();
    
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    const highlight = document.createElement('div');
    highlight.className = 'xclv-highlight-frame';
    highlight.style.left = `${rect.left + scrollLeft - 5}px`;
    highlight.style.top = `${rect.top + scrollTop - 5}px`;
    highlight.style.width = `${rect.width + 10}px`;
    highlight.style.height = `${rect.height + 10}px`;
    
    document.body.appendChild(highlight);
    this.currentHighlight = highlight;
    this.lastAnalyzedElement = element;
  }

  showAnalyzeButton(element) {
    this.hideAnalyzeButton();
    
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    const button = document.createElement('button');
    button.className = 'xclv-analyze-button';
    button.textContent = '🔍 Analyze Content';
    button.style.left = `${rect.right + scrollLeft - 150}px`;
    button.style.top = `${rect.top + scrollTop - 45}px`;
    
    button.addEventListener('click', () => {
      this.analyzeElement(element);
    });
    
    button.addEventListener('mouseenter', () => {
      clearTimeout(this.hideTimeout);
    });
    
    document.body.appendChild(button);
    this.analyzeButton = button;
  }

  hideAnalyzeButton() {
    if (this.analyzeButton) {
      this.analyzeButton.remove();
      this.analyzeButton = null;
    }
  }

  clearHighlight() {
    if (this.currentHighlight) {
      this.currentHighlight.remove();
      this.currentHighlight = null;
    }
  }

  isMouseOverHighlightArea(x, y) {
    if (!this.currentHighlight && !this.analyzeButton) return false;
    
    const elements = document.elementsFromPoint(x, y);
    return elements.some(el => 
      el.classList.contains('xclv-highlight-frame') ||
      el.classList.contains('xclv-analyze-button') ||
      el === this.lastAnalyzedElement
    );
  }

  async analyzeElement(element) {
    const text = element.textContent.trim();
    const context = this.getElementContext(element);
    
    this.showDebugPopup();
    this.updateDebugContent('loading');
    
    try {
      const contentData = {
        text: text,
        context: context,
        element: {
          tagName: element.tagName,
          className: element.className,
          id: element.id,
          textLength: text.length
        },
        page: {
          url: window.location.href,
          title: document.title,
          domain: window.location.hostname
        }
      };
      
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'analyzeTextElement',
          data: contentData
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });
      
      this.updateDebugContent('result', {
        parsedContent: contentData,
        systemPrompt: response.systemPrompt || 'System prompt not available',
        llmOutput: response.data || 'No LLM output available',
        response: response
      });
      
    } catch (error) {
      console.error('Analysis failed:', error);
      this.updateDebugContent('error', { error: error.message });
    }
  }

  getElementContext(element) {
    const context = {
      parentElement: element.parentElement?.tagName || 'none',
      siblingCount: element.parentElement?.children.length || 0,
      position: Array.from(element.parentElement?.children || []).indexOf(element),
      hasImages: element.querySelectorAll('img').length > 0,
      hasLinks: element.querySelectorAll('a').length > 0,
      nearbyHeadings: this.getNearbyHeadings(element),
      styling: this.getElementStyling(element)
    };
    
    return context;
  }

  getNearbyHeadings(element) {
    const headings = [];
    let current = element;
    
    while (current && headings.length < 3) {
      current = current.previousElementSibling || current.parentElement;
      if (current && /^h[1-6]$/i.test(current.tagName)) {
        headings.unshift({
          level: current.tagName.toLowerCase(),
          text: current.textContent.trim().substring(0, 100)
        });
      }
    }
    
    return headings;
  }

  getElementStyling(element) {
    const styles = window.getComputedStyle(element);
    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      display: styles.display,
      position: styles.position
    };
  }

  showDebugPopup() {
    this.closeDebugPopup();
    
    const backdrop = document.createElement('div');
    backdrop.className = 'xclv-debug-backdrop';
    backdrop.addEventListener('click', () => this.closeDebugPopup());
    
    const popup = document.createElement('div');
    popup.className = 'xclv-debug-popup';
    popup.innerHTML = `
      <div class="xclv-debug-header">
        <h2 style="color: #4CAF50; margin: 0; font-size: 18px;">XCLV Content Analysis Debug</h2>
        <button class="xclv-debug-close">&times;</button>
      </div>
      <div class="xclv-debug-tabs">
        <button class="xclv-debug-tab active" data-tab="content">Parsed Content</button>
        <button class="xclv-debug-tab" data-tab="prompt">System Prompt</button>
        <button class="xclv-debug-tab" data-tab="output">LLM Output</button>
        <button class="xclv-debug-tab" data-tab="raw">Raw Response</button>
      </div>
      <div class="xclv-debug-content">
        <div class="xclv-debug-tab-content active" id="xclv-content-tab">
          <div class="xclv-debug-loading">
            <div class="xclv-spinner"></div>
            <span>Extracting content...</span>
          </div>
        </div>
        <div class="xclv-debug-tab-content" id="xclv-prompt-tab">
          <div class="xclv-debug-loading">
            <div class="xclv-spinner"></div>
            <span>Preparing prompt...</span>
          </div>
        </div>
        <div class="xclv-debug-tab-content" id="xclv-output-tab">
          <div class="xclv-debug-loading">
            <div class="xclv-spinner"></div>
            <span>Analyzing with Gemini...</span>
          </div>
        </div>
        <div class="xclv-debug-tab-content" id="xclv-raw-tab">
          <div class="xclv-debug-loading">
            <div class="xclv-spinner"></div>
            <span>Processing response...</span>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(backdrop);
    document.body.appendChild(popup);
    
    this.debugPopup = { backdrop, popup };
    
    popup.querySelector('.xclv-debug-close').addEventListener('click', () => {
      this.closeDebugPopup();
    });
    
    popup.querySelectorAll('.xclv-debug-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchDebugTab(tabName);
      });
    });
    
    popup.addEventListener('click', (e) => e.stopPropagation());
  }

  switchDebugTab(tabName) {
    if (!this.debugPopup) return;
    
    const popup = this.debugPopup.popup;
    
    popup.querySelectorAll('.xclv-debug-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    popup.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    popup.querySelectorAll('.xclv-debug-tab-content').forEach(content => {
      content.classList.remove('active');
    });
    popup.querySelector(`#xclv-${tabName}-tab`).classList.add('active');
  }

  updateDebugContent(type, data = {}) {
    if (!this.debugPopup) return;
    
    const popup = this.debugPopup.popup;
    
    if (type === 'loading') {
      return;
    }
    
    if (type === 'error') {
      popup.querySelectorAll('.xclv-debug-tab-content').forEach(content => {
        content.innerHTML = `
          <div class="xclv-debug-section">
            <h3 style="color: #4CAF50; margin: 0 0 15px 0;">Error</h3>
            <div class="xclv-debug-code" style="color: #ff6b6b;">
              ${data.error}
            </div>
          </div>
        `;
      });
      return;
    }
    
    if (type === 'result') {
      const contentTab = popup.querySelector('#xclv-content-tab');
      contentTab.innerHTML = `
        <div class="xclv-debug-section">
          <h3 style="color: #4CAF50; margin: 0 0 15px 0;">Extracted Text (${data.parsedContent.text.length} characters)</h3>
          <div class="xclv-debug-code">${this.escapeHtml(data.parsedContent.text)}</div>
        </div>
        <div class="xclv-debug-section">
          <h3 style="color: #4CAF50; margin: 0 0 15px 0;">Element Context</h3>
          <div class="xclv-debug-json">${this.formatJSON(data.parsedContent.context)}</div>
        </div>
      `;
      
      const promptTab = popup.querySelector('#xclv-prompt-tab');
      promptTab.innerHTML = `
        <div class="xclv-debug-section">
          <h3 style="color: #4CAF50; margin: 0 0 15px 0;">System Prompt Sent to Gemini</h3>
          <div class="xclv-debug-code">${this.escapeHtml(data.systemPrompt)}</div>
        </div>
      `;
      
      const outputTab = popup.querySelector('#xclv-output-tab');
      outputTab.innerHTML = `
        <div class="xclv-debug-section">
          <h3 style="color: #4CAF50; margin: 0 0 15px 0;">Gemini Analysis Result</h3>
          <div class="xclv-debug-json">${this.formatJSON(data.llmOutput)}</div>
        </div>
      `;
      
      const rawTab = popup.querySelector('#xclv-raw-tab');
      rawTab.innerHTML = `
        <div class="xclv-debug-section">
          <h3 style="color: #4CAF50; margin: 0 0 15px 0;">Complete API Response</h3>
          <div class="xclv-debug-json">${this.formatJSON(data.response)}</div>
        </div>
      `;
    }
  }

  formatJSON(obj) {
    const json = JSON.stringify(obj, null, 2);
    return json
      .replace(/("([^"]+)":)/g, '<span style="color: #79C0FF;">$1</span>')
      .replace(/"([^"]+)"/g, '<span style="color: #A5D6FF;">"$1"</span>')
      .replace(/: (\d+)/g, ': <span style="color: #79C0FF;">$1</span>')
      .replace(/: (true|false)/g, ': <span style="color: #FFA657;">$1</span>');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  closeDebugPopup() {
    if (this.debugPopup) {
      this.debugPopup.backdrop.remove();
      this.debugPopup.popup.remove();
      this.debugPopup = null;
    }
  }
}

// Keep the rest of the existing content script classes...
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
        console.warn(`Failed to extract content from selector ${selector}:`, error);
      }
    });
    
    return content.trim();
  }

  isUIElement(element) {
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
      console.warn('Failed to extract headlines:', error);
      return [];
    }
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
        console.warn(`Failed to extract CTAs from selector ${selector}:`, error);
      }
    });
    
    return ctas;
  }

  extractNavigation() {
    const navigation = [];
    
    try {
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
    } catch (error) {
      console.warn('Failed to extract navigation:', error);
    }
    
    return navigation;
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
      console.warn('Failed to extract metadata:', error);
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
    const closeBtn = this.panel.querySelector('.xclv-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hidePanel();
      });
    }

    const tabs = this.panel.querySelectorAll('.xclv-tab');
    tabs.forEach(tab => {
      if (tab) {
        tab.addEventListener('click', (e) => {
          const tabName = e.target.dataset.tab;
          if (tabName) {
            this.switchTab(tabName);
          }
        });
      }
    });

    this.makeDraggable();
  }

  switchTab(tabName) {
    try {
      this.panel.querySelectorAll('.xclv-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      
      const activeTab = this.panel.querySelector(`[data-tab="${tabName}"]`);
      if (activeTab) {
        activeTab.classList.add('active');
      }

      this.panel.querySelectorAll('.xclv-tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      const activeContent = this.panel.querySelector(`#xclv-${tabName}-content`);
      if (activeContent) {
        activeContent.classList.add('active');
      }
    } catch (error) {
      console.warn('Failed to switch tab:', error);
    }
  }

  makeDraggable() {
    const header = this.panel.querySelector('.xclv-panel-header');
    if (!header) return;

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
      if (header) {
        header.style.cursor = 'grab';
      }
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

    try {
      const overviewContent = this.panel.querySelector('#xclv-overview-content');
      if (overviewContent) {
        overviewContent.innerHTML = this.buildOverviewHTML(data);
      }

      const toneContent = this.panel.querySelector('#xclv-tone-content');
      if (toneContent) {
        toneContent.innerHTML = this.buildToneHTML(data.tone);
      }

      const archetypesContent = this.panel.querySelector('#xclv-archetypes-content');
      if (archetypesContent) {
        archetypesContent.innerHTML = this.buildArchetypesHTML(data.archetypes);
      }
    } catch (error) {
      console.warn('Failed to update analysis results:', error);
    }
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
    if (!element) return false;
    
    const text = element.textContent?.trim() || '';
    
    if (text.length < 10 || text.length > 200) return false;
    
    if (element.closest('.xclv-analysis-panel, .xclv-overlay')) return false;
    
    const tagName = element.tagName.toLowerCase();
    if (['script', 'style', 'meta', 'link'].includes(tagName)) return false;
    
    return true;
  }

  async showAnalysisOverlay(element, event) {
    const text = element.textContent.trim();
    
    let analysis = this.analysisCache.get(text);
    if (!analysis) {
      analysis = this.getMockAnalysis(text);
      this.analysisCache.set(text, analysis);
    }

    this.createOverlay(element, analysis, event);
  }

  getMockAnalysis(text) {
    const clarityScore = Math.floor(Math.random() * 40) + 60;
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

    try {
      const rect = element.getBoundingClientRect();
      overlay.style.position = 'absolute';
      overlay.style.left = `${rect.left + window.scrollX}px`;
      overlay.style.top = `${rect.bottom + window.scrollY + 5}px`;
      overlay.style.zIndex = '10000';

      document.body.appendChild(overlay);
      this.activeOverlay = overlay;

      setTimeout(() => this.hideAnalysisOverlay(), 3000);
    } catch (error) {
      console.warn('Failed to position overlay:', error);
    }
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

// Enhanced XCLVContentController with interactive features
class XCLVContentController {
  constructor() {
    this.extractor = new WebContentExtractor();
    this.ui = new BrandAnalysisUI();
    this.overlay = new TextAnalysisOverlay();
    this.interactiveAnalyzer = new InteractiveContentAnalyzer();
    this.isAnalyzing = false;
  }

  initialize() {
    try {
      this.setupMessageListener();
      this.overlay.setupMouseoverAnalysis();
      console.log('XCLV Brand Analysis content script initialized');
    } catch (error) {
      console.error('Failed to initialize XCLV:', error);
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      try {
        switch (request.action) {
          case 'startAnalysis':
            this.startAnalysis().then(sendResponse).catch(error => {
              sendResponse({ success: false, error: error.message });
            });
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
        }
      } catch (error) {
        console.error('Message handler error:', error);
        sendResponse({ success: false, error: error.message });
      }
    });
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
      
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'analyzeContent',
          data: {
            text: mainText,
            url: window.location.href,
            metadata: content.metadata
          }
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });
      
      console.log('XCLV: Background response:', response);
      
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
    if (!settings) return;
    
    this.extractor.settings = { ...this.extractor.settings, ...settings };
    
    if (settings.hasOwnProperty('hoverInsights')) {
      this.overlay.setEnabled(settings.hoverInsights);
    }
  }
}

// Initialize enhanced XCLV
function initializeEnhancedXCLV() {
  if (window.xclvController) {
    console.log('XCLV already initialized');
    return;
  }

  try {
    window.xclvController = new XCLVContentController();
    window.xclvController.initialize();
    console.log('Enhanced XCLV Content Controller initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Enhanced XCLV Content Controller:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEnhancedXCLV);
} else {
  setTimeout(initializeEnhancedXCLV, 100);
}

// Handle SPA navigation
if (window.MutationObserver) {
  const observer = new MutationObserver((mutations) => {
    const hasSignificantChanges = mutations.some(mutation => 
      mutation.type === 'childList' && mutation.addedNodes.length > 0
    );
    
    if (hasSignificantChanges && !window.xclvController) {
      setTimeout(initializeEnhancedXCLV, 500);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}