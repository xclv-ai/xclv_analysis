// XCLV Brand Analysis - Robust Content Script
// Enhanced error handling and defensive programming

class InteractiveContentAnalyzer {
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

  injectStyles() {
    if (document.getElementById('xclv-interactive-styles')) return;

    try {
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

        @keyframes xclv-popup-appear {
          0% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.7); 
          }
          100% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1); 
          }
        }
      `;
      
      if (document.head) {
        document.head.appendChild(styles);
      } else {
        document.documentElement.appendChild(styles);
      }
    } catch (error) {
      console.error('XCLV: Failed to inject styles:', error);
    }
  }

  setupMouseListeners() {
    try {
      this.mouseOverHandler = this.handleMouseOver.bind(this);
      this.mouseOutHandler = this.handleMouseOut.bind(this);
      
      document.addEventListener('mouseover', this.mouseOverHandler, { passive: true });
      document.addEventListener('mouseout', this.mouseOutHandler, { passive: true });
    } catch (error) {
      console.error('XCLV: Failed to setup mouse listeners:', error);
    }
  }

  removeMouseListeners() {
    try {
      if (this.mouseOverHandler) {
        document.removeEventListener('mouseover', this.mouseOverHandler);
      }
      if (this.mouseOutHandler) {
        document.removeEventListener('mouseout', this.mouseOutHandler);
      }
    } catch (error) {
      console.error('XCLV: Failed to remove mouse listeners:', error);
    }
  }

  handleMouseOver(event) {
    if (!this.isHoverMode) return;
    
    try {
      const element = event.target;
      if (this.shouldAnalyzeElement(element)) {
        this.highlightElement(element);
        this.showAnalyzeButton(element);
      }
    } catch (error) {
      console.error('XCLV: Error in mouseover handler:', error);
    }
  }

  handleMouseOut(event) {
    if (!this.isHoverMode) return;
    
    try {
      const relatedTarget = event.relatedTarget;
      
      if (relatedTarget && (
        relatedTarget.classList?.contains('xclv-analyze-button') ||
        relatedTarget.classList?.contains('xclv-highlight-frame') ||
        this.currentHighlight?.contains(relatedTarget)
      )) {
        return;
      }
      
      setTimeout(() => {
        try {
          if (!this.isMouseOverHighlightArea(event.clientX, event.clientY)) {
            this.clearHighlight();
            this.hideAnalyzeButton();
          }
        } catch (error) {
          console.error('XCLV: Error in delayed mouseout:', error);
        }
      }, 100);
    } catch (error) {
      console.error('XCLV: Error in mouseout handler:', error);
    }
  }

  shouldAnalyzeElement(element) {
    try {
      if (!element || !element.textContent) return false;
      
      const text = element.textContent.trim();
      
      if (text.length < 20 || text.length > 1000) return false;
      
      if (element.closest('.xclv-analysis-panel, .xclv-debug-popup, .xclv-highlight-frame, .xclv-analyze-button')) {
        return false;
      }
      
      const tagName = element.tagName?.toLowerCase();
      if (['script', 'style', 'meta', 'link', 'nav', 'header', 'footer'].includes(tagName)) {
        return false;
      }
      
      const contentElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'article', 'section', 'div'];
      if (!contentElements.includes(tagName)) return false;
      
      return true;
    } catch (error) {
      console.error('XCLV: Error checking element:', error);
      return false;
    }
  }

  highlightElement(element) {
    try {
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
    } catch (error) {
      console.error('XCLV: Error highlighting element:', error);
    }
  }

  showAnalyzeButton(element) {
    try {
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
    } catch (error) {
      console.error('XCLV: Error showing analyze button:', error);
    }
  }

  hideAnalyzeButton() {
    try {
      if (this.analyzeButton) {
        this.analyzeButton.remove();
        this.analyzeButton = null;
      }
    } catch (error) {
      console.error('XCLV: Error hiding analyze button:', error);
    }
  }

  clearHighlight() {
    try {
      if (this.currentHighlight) {
        this.currentHighlight.remove();
        this.currentHighlight = null;
      }
    } catch (error) {
      console.error('XCLV: Error clearing highlight:', error);
    }
  }

  isMouseOverHighlightArea(x, y) {
    try {
      if (!this.currentHighlight && !this.analyzeButton) return false;
      
      const elements = document.elementsFromPoint(x, y);
      return elements.some(el => 
        el?.classList?.contains('xclv-highlight-frame') ||
        el?.classList?.contains('xclv-analyze-button') ||
        el === this.lastAnalyzedElement
      );
    } catch (error) {
      console.error('XCLV: Error checking mouse position:', error);
      return false;
    }
  }

  async analyzeElement(element) {
    try {
      const text = element.textContent.trim();
      const context = this.getElementContext(element);
      
      this.showDebugPopup();
      this.updateDebugContent('loading');
      
      const contentData = {
        text: text,
        context: context,
        element: {
          tagName: element.tagName,
          className: element.className || '',
          id: element.id || '',
          textLength: text.length
        },
        page: {
          url: window.location.href,
          title: document.title,
          domain: window.location.hostname
        }
      };
      
      const response = await this.sendMessageSafely({
        action: 'analyzeTextElement',
        data: contentData
      });
      
      this.updateDebugContent('result', {
        parsedContent: contentData,
        systemPrompt: response.systemPrompt || 'System prompt not available',
        llmOutput: response.data || 'No LLM output available',
        response: response
      });
      
    } catch (error) {
      console.error('XCLV: Analysis failed:', error);
      this.updateDebugContent('error', { error: error.message });
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

  getElementContext(element) {
    try {
      return {
        parentElement: element.parentElement?.tagName || 'none',
        siblingCount: element.parentElement?.children.length || 0,
        position: Array.from(element.parentElement?.children || []).indexOf(element),
        hasImages: element.querySelectorAll('img').length > 0,
        hasLinks: element.querySelectorAll('a').length > 0,
        nearbyHeadings: this.getNearbyHeadings(element),
        styling: this.getElementStyling(element)
      };
    } catch (error) {
      console.error('XCLV: Error getting element context:', error);
      return {};
    }
  }

  getNearbyHeadings(element) {
    try {
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
    } catch (error) {
      console.error('XCLV: Error getting nearby headings:', error);
      return [];
    }
  }

  getElementStyling(element) {
    try {
      const styles = window.getComputedStyle(element);
      return {
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        display: styles.display,
        position: styles.position
      };
    } catch (error) {
      console.error('XCLV: Error getting element styling:', error);
      return {};
    }
  }

  showDebugPopup() {
    try {
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
    } catch (error) {
      console.error('XCLV: Error showing debug popup:', error);
    }
  }

  switchDebugTab(tabName) {
    try {
      if (!this.debugPopup) return;
      
      const popup = this.debugPopup.popup;
      
      popup.querySelectorAll('.xclv-debug-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      popup.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
      
      popup.querySelectorAll('.xclv-debug-tab-content').forEach(content => {
        content.classList.remove('active');
      });
      popup.querySelector(`#xclv-${tabName}-tab`)?.classList.add('active');
    } catch (error) {
      console.error('XCLV: Error switching debug tab:', error);
    }
  }

  updateDebugContent(type, data = {}) {
    try {
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
                ${this.escapeHtml(data.error)}
              </div>
            </div>
          `;
        });
        return;
      }
      
      if (type === 'result') {
        const contentTab = popup.querySelector('#xclv-content-tab');
        if (contentTab) {
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
        }
        
        const promptTab = popup.querySelector('#xclv-prompt-tab');
        if (promptTab) {
          promptTab.innerHTML = `
            <div class="xclv-debug-section">
              <h3 style="color: #4CAF50; margin: 0 0 15px 0;">System Prompt Sent to Gemini</h3>
              <div class="xclv-debug-code">${this.escapeHtml(data.systemPrompt)}</div>
            </div>
          `;
        }
        
        const outputTab = popup.querySelector('#xclv-output-tab');
        if (outputTab) {
          outputTab.innerHTML = `
            <div class="xclv-debug-section">
              <h3 style="color: #4CAF50; margin: 0 0 15px 0;">Gemini Analysis Result</h3>
              <div class="xclv-debug-json">${this.formatJSON(data.llmOutput)}</div>
            </div>
          `;
        }
        
        const rawTab = popup.querySelector('#xclv-raw-tab');
        if (rawTab) {
          rawTab.innerHTML = `
            <div class="xclv-debug-section">
              <h3 style="color: #4CAF50; margin: 0 0 15px 0;">Complete API Response</h3>
              <div class="xclv-debug-json">${this.formatJSON(data.response)}</div>
            </div>
          `;
        }
      }
    } catch (error) {
      console.error('XCLV: Error updating debug content:', error);
    }
  }

  formatJSON(obj) {
    try {
      const json = JSON.stringify(obj, null, 2);
      return json
        .replace(/(\"([^\"]+)\":)/g, '<span style="color: #79C0FF;">$1</span>')
        .replace(/\"([^\"]+)\"/g, '<span style="color: #A5D6FF;">\"$1\"</span>')
        .replace(/: (\\d+)/g, ': <span style="color: #79C0FF;">$1</span>')
        .replace(/: (true|false)/g, ': <span style="color: #FFA657;">$1</span>');
    } catch (error) {
      console.error('XCLV: Error formatting JSON:', error);
      return String(obj);
    }
  }

  escapeHtml(text) {
    try {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    } catch (error) {
      console.error('XCLV: Error escaping HTML:', error);
      return String(text);
    }
  }

  closeDebugPopup() {
    try {
      if (this.debugPopup) {
        this.debugPopup.backdrop.remove();
        this.debugPopup.popup.remove();
        this.debugPopup = null;
      }
    } catch (error) {
      console.error('XCLV: Error closing debug popup:', error);
    }
  }
}

// Keep the rest of the existing content script classes with better error handling...
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

// Enhanced XCLVContentController with robust error handling
class XCLVContentController {
  constructor() {
    this.extractor = new WebContentExtractor();
    this.interactiveAnalyzer = new InteractiveContentAnalyzer();
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
          sendResponse({ success: true, message: 'Panel functionality not implemented' });
          break;
          
        case 'hidePanel':
          sendResponse({ success: true, message: 'Panel functionality not implemented' });
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