// XCLV Brand Analysis Extension - Content Script
// Click-to-Analyze Interactive Mode v1.2.20

// Prevent duplicate loading and class redeclaration errors
if (window.xclvContentLoaded) {
  console.log('XCLV: Content script already loaded, skipping...');
  // Don't execute the rest of the file if already loaded
} else {
  window.xclvContentLoaded = true;
  console.log('XCLV: Content script loading v1.2.20...');

// Safe class declarations with existence checks
if (typeof window.ContentExtractor === 'undefined') {
  window.ContentExtractor = class ContentExtractor {
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
  };
}

// Analysis Panel Class
if (typeof window.AnalysisPanel === 'undefined') {
  window.AnalysisPanel = class AnalysisPanel {
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
              <span class="xclv-toggle-label">✨ Click-to-Analyze Mode</span>
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
              <span class="xclv-checkbox-label">Show Element Outlines</span>
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
  };
}

// Interactive Content Analyzer Class - CLICK-TO-ANALYZE MODE
if (typeof window.InteractiveContentAnalyzer === 'undefined') {
  window.InteractiveContentAnalyzer = class InteractiveContentAnalyzer {
    constructor() {
      this.isHoverMode = false;
      this.currentHoveredElement = null;
      this.selectedElement = null; // Currently selected element
      this.analyzeButton = null;
      this.analysisOverlay = null;
      this.analysisCache = new Map();
      this.isAnalyzing = false;
      this.debugMode = true;
      
      console.log('XCLV: InteractiveContentAnalyzer initialized with click-to-analyze mode');
    }

    enable() {
      if (this.isHoverMode) return;
      
      this.isHoverMode = true;
      this.setupMouseEvents();
      this.showModeNotification('Click-to-analyze mode enabled - hover to highlight, click to select');
      console.log('XCLV: Click-to-analyze hover mode ENABLED');
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
      
      // Bind methods to preserve 'this' context
      this.boundMouseOver = this.handleMouseOver.bind(this);
      this.boundMouseOut = this.handleMouseOut.bind(this);
      this.boundClick = this.handleClick.bind(this);
      
      // Add new listeners with proper binding
      document.addEventListener('mouseover', this.boundMouseOver, true);
      document.addEventListener('mouseout', this.boundMouseOut, true);
      document.addEventListener('click', this.boundClick, true);
      
      console.log('XCLV: Click-to-analyze mouse event listeners attached');
    }

    removeMouseEvents() {
      if (this.boundMouseOver) {
        document.removeEventListener('mouseover', this.boundMouseOver, true);
      }
      if (this.boundMouseOut) {
        document.removeEventListener('mouseout', this.boundMouseOut, true);
      }
      if (this.boundClick) {
        document.removeEventListener('click', this.boundClick, true);
      }
    }

    handleMouseOver(event) {
      if (!this.isHoverMode || this.isAnalyzing) return;

      const element = event.target;
      
      // Skip if hovering over XCLV elements
      if (this.isXCLVElement(element)) return;
      
      // Skip if this element is already selected (has analyze button)
      if (element === this.selectedElement) return;
      
      // Check if element is analyzable
      if (this.isAnalyzableElement(element)) {
        // Only highlight, don't show button yet
        this.highlightElement(element);
        this.currentHoveredElement = element;
        
        console.log('XCLV: Hovering over element:', {
          tag: element.tagName,
          text: element.textContent.trim().substring(0, 50) + '...',
          classes: element.className
        });
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

      // Don't remove highlight if this is the selected element
      if (element === this.selectedElement) return;

      if (element === this.currentHoveredElement) {
        this.removeHighlight(element);
        this.currentHoveredElement = null;
      }
    }

    // ENHANCED: Much more robust click handling
    handleClick(event) {
      console.log('🔍 XCLV: DETAILED Click event detected:', {
        target: event.target.tagName,
        targetClass: event.target.className,
        targetId: event.target.id,
        isAnalyzableElement: this.isAnalyzableElement(event.target),
        isXCLVElement: this.isXCLVElement(event.target),
        isHoverMode: this.isHoverMode,
        isAnalyzing: this.isAnalyzing,
        eventPhase: event.eventPhase,
        bubbles: event.bubbles,
        cancelable: event.cancelable
      });

      // PRIORITY 1: Handle analyze button clicks with multiple detection methods
      const isAnalyzeButton = this.isAnalyzeButtonClick(event.target);
      if (isAnalyzeButton) {
        console.log('🚀 XCLV: ANALYZE BUTTON CLICKED - Processing...');
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation(); // Stop all other handlers
        
        if (this.selectedElement) {
          console.log('🚀 XCLV: Starting analysis for selected element');
          this.analyzeElement(this.selectedElement);
        } else {
          console.warn('🚀 XCLV: No selected element to analyze');
        }
        return;
      }

      // PRIORITY 2: Handle element selection
      if (!this.isHoverMode || this.isAnalyzing) {
        console.log('XCLV: Click ignored - mode disabled or analyzing');
        return;
      }

      const element = event.target;
      
      // Skip if clicking on XCLV elements
      if (this.isXCLVElement(element)) {
        console.log('XCLV: Click ignored - XCLV element');
        return;
      }

      // Check if element is analyzable
      if (this.isAnalyzableElement(element)) {
        console.log('🎯 XCLV: Analyzable element clicked!');
        
        // If clicking on already selected element, deselect it
        if (element === this.selectedElement) {
          console.log('XCLV: Deselecting same element');
          this.deselectElement();
          return;
        }

        // If another element was selected, deselect it first
        if (this.selectedElement) {
          console.log('XCLV: Deselecting previous element');
          this.deselectElement();
        }

        // Select the new element
        console.log('🎯 XCLV: Selecting new element');
        this.selectElement(element);
        
        event.preventDefault();
        event.stopPropagation();
      } else {
        console.log('XCLV: Element not analyzable:', {
          tag: element.tagName,
          text: element.textContent?.trim().substring(0, 50)
        });
      }
    }

    // NEW: Better button detection method
    isAnalyzeButtonClick(target) {
      try {
        // Method 1: Direct class check
        if (target && target.classList && target.classList.contains('xclv-analyze-btn-inline')) {
          console.log('🔍 Method 1: Direct class match');
          return true;
        }
        
        // Method 2: Closest ancestor check
        if (target && target.closest && target.closest('.xclv-analyze-btn-inline')) {
          console.log('🔍 Method 2: Ancestor class match');
          return true;
        }
        
        // Method 3: Check if it's a child of our button
        if (this.analyzeButton && target && this.analyzeButton.contains(target)) {
          console.log('🔍 Method 3: Child of our button');
          return true;
        }
        
        // Method 4: Direct reference check
        if (this.analyzeButton && target === this.analyzeButton) {
          console.log('🔍 Method 4: Direct button reference');
          return true;
        }
        
        return false;
      } catch (error) {
        console.warn('XCLV: Error in isAnalyzeButtonClick:', error);
        return false;
      }
    }

    // Select element and show analyze button
    selectElement(element) {
      console.log('XCLV: selectElement called for:', element.tagName);
      this.selectedElement = element;
      
      // Add selection styling (different from hover)
      element.classList.add('xclv-selected');
      element.classList.remove('xclv-highlighted'); // Remove hover highlight
      
      // Show the analyze button attached to this element
      this.showAnalyzeButton(element);
      
      console.log('XCLV: Element selected:', {
        tag: element.tagName,
        text: element.textContent.trim().substring(0, 50) + '...',
        hasClass: element.classList.contains('xclv-selected')
      });
    }

    // Deselect element and hide analyze button
    deselectElement() {
      if (this.selectedElement) {
        this.selectedElement.classList.remove('xclv-selected');
        this.selectedElement = null;
      }
      
      this.hideAnalyzeButton();
      
      console.log('XCLV: Element deselected');
    }

    // FIXED: Better element checking to prevent TypeError
    isXCLVElement(element) {
      try {
        // Check for null/undefined element
        if (!element) return false;
        
        // Check closest selectors
        if (element.closest('#xclv-analysis-panel') ||
            element.closest('.xclv-analyze-btn-inline') ||
            element.closest('.xclv-analysis-overlay')) {
          return true;
        }
        
        // Check classList existence before using contains
        if (element.classList && (
            element.classList.contains('xclv-highlighted') ||
            element.classList.contains('xclv-selected'))) {
          return true;
        }
        
        // Safe check for element.id and startsWith
        if (element.id && typeof element.id === 'string' && element.id.startsWith('xclv-')) {
          return true;
        }
        
        return false;
      } catch (error) {
        console.warn('XCLV: Error in isXCLVElement:', error);
        return false; // Default to not being an XCLV element if error occurs
      }
    }

    isAnalyzableElement(element) {
      // Skip non-text elements
      if (!element || !element.tagName) return false;
      
      // Check tag types - EXPANDED LIST
      const analyzableTags = [
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
        'span', 'div', 'a', 'button', 'li', 'td', 'th',
        'label', 'strong', 'em', 'b', 'i', 'small',
        'blockquote', 'quote', 'figcaption'
      ];
      
      const tagName = element.tagName.toLowerCase();
      if (!analyzableTags.includes(tagName)) return false;

      // Check text content
      const text = element.textContent?.trim();
      if (!text || text.length < 5 || text.length > 1000) return false;

      // Skip elements with mostly child elements (containers)
      const childElements = element.children.length;
      const textLength = text.length;
      if (childElements > 3 && textLength / childElements < 10) return false;

      // Check visibility
      if (!this.isElementVisible(element)) return false;

      // Skip if it's a child of an already analyzable parent
      let parent = element.parentElement;
      while (parent && parent !== document.body) {
        if (parent.classList?.contains('xclv-highlighted') || 
            parent.classList?.contains('xclv-selected')) return false;
        parent = parent.parentElement;
      }

      return true;
    }

    isElementVisible(element) {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      
      return rect.width > 10 && 
             rect.height > 10 && 
             style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             style.opacity !== '0' &&
             rect.top < window.innerHeight &&
             rect.bottom > 0;
    }

    highlightElement(element) {
      element.classList.add('xclv-highlighted');
      // The CSS will handle the blur and outline effects
    }

    removeHighlight(element) {
      if (element) {
        element.classList.remove('xclv-highlighted');
      }
    }

    // ENHANCED: Show analyze button with multiple click handlers
    showAnalyzeButton(element) {
      console.log('🔨 XCLV: showAnalyzeButton called for:', element.tagName);
      
      this.hideAnalyzeButton(); // Remove any existing button

      const rect = element.getBoundingClientRect();
      console.log('XCLV: Element rect:', rect);
      
      // Create button element
      this.analyzeButton = document.createElement('button');
      this.analyzeButton.className = 'xclv-analyze-btn-inline xclv-btn-selected';
      this.analyzeButton.innerHTML = '🔍 ANALYZE CONTENT';
      this.analyzeButton.title = 'Click to analyze this selected text element';
      
      // CRITICAL: Multiple event binding strategies
      
      // Strategy 1: Direct click event listener
      this.analyzeButton.addEventListener('click', (e) => {
        console.log('🚀 STRATEGY 1: Direct button click fired!');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.analyzeElement(this.selectedElement);
      }, true); // Use capture phase
      
      // Strategy 2: Mousedown as backup
      this.analyzeButton.addEventListener('mousedown', (e) => {
        console.log('🚀 STRATEGY 2: Button mousedown fired!');
        e.preventDefault();
        e.stopPropagation();
      }, true);
      
      // Strategy 3: Mouseup as another backup
      this.analyzeButton.addEventListener('mouseup', (e) => {
        console.log('🚀 STRATEGY 3: Button mouseup fired!');
        e.preventDefault();
        e.stopPropagation();
        // Small delay to see if click fires first
        setTimeout(() => {
          console.log('🚀 STRATEGY 3: Mouseup backup trigger');
          this.analyzeElement(this.selectedElement);
        }, 10);
      }, true);
      
      // Strategy 4: Pointer events
      this.analyzeButton.addEventListener('pointerdown', (e) => {
        console.log('🚀 STRATEGY 4: Button pointerdown fired!');
        e.preventDefault();
        e.stopPropagation();
      }, true);
      
      // Position the button next to the element
      this.analyzeButton.style.position = 'fixed';
      this.analyzeButton.style.left = `${rect.left}px`;
      this.analyzeButton.style.top = `${rect.bottom + 8}px`;
      this.analyzeButton.style.zIndex = '999999';
      
      // Ensure button stays in viewport
      const buttonWidth = 160;
      const buttonHeight = 40;
      
      if (rect.left + buttonWidth > window.innerWidth) {
        this.analyzeButton.style.left = `${window.innerWidth - buttonWidth - 10}px`;
      }
      
      if (rect.bottom + buttonHeight > window.innerHeight) {
        this.analyzeButton.style.top = `${rect.top - buttonHeight - 8}px`;
      }
      
      // Force display and visibility
      this.analyzeButton.style.display = 'block';
      this.analyzeButton.style.visibility = 'visible';
      this.analyzeButton.style.opacity = '1';
      this.analyzeButton.style.pointerEvents = 'auto';
      this.analyzeButton.style.cursor = 'pointer';
      
      // Add to DOM
      document.body.appendChild(this.analyzeButton);
      
      console.log('🔨 XCLV: Analyze button created with multiple event handlers:', {
        element: element.tagName,
        buttonElement: this.analyzeButton,
        buttonInDOM: document.body.contains(this.analyzeButton),
        buttonRect: this.analyzeButton.getBoundingClientRect()
      });
      
      // Test button existence after a moment
      setTimeout(() => {
        if (this.analyzeButton && document.body.contains(this.analyzeButton)) {
          console.log('✅ XCLV: Button confirmed in DOM and ready for clicks');
        } else {
          console.error('❌ XCLV: Button not found in DOM after creation');
        }
      }, 100);
    }

    hideAnalyzeButton() {
      if (this.analyzeButton) {
        console.log('🗑️ XCLV: Removing analyze button');
        this.analyzeButton.remove();
        this.analyzeButton = null;
      }
    }

    async analyzeElement(element) {
      if (!element || this.isAnalyzing) return;

      try {
        this.isAnalyzing = true;
        console.log('🔬 XCLV: Starting analysis for element:', element.tagName);
        
        const text = element.textContent.trim();
        
        // Show debug popup if in debug mode
        if (this.debugMode) {
          this.showDebugPopup(element, text);
        }
        
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

    showDebugPopup(element, text) {
      try {
        const debugData = {
          element: {
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            textContent: text,
            innerHTML: element.innerHTML.substring(0, 200) + '...'
          },
          context: this.getElementContext(element),
          url: window.location.href,
          timestamp: new Date().toISOString()
        };

        // Create debug popup window
        const debugWindow = window.open('', 'xclv-debug', 'width=600,height=400,scrollbars=yes,resizable=yes');
        
        if (debugWindow) {
          debugWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>XCLV Debug - Element Analysis</title>
              <style>
                body { font-family: monospace; margin: 20px; background: #1a1a2e; color: #fff; }
                h2 { color: #00ff88; border-bottom: 1px solid #00ff88; padding-bottom: 5px; }
                .section { margin: 20px 0; padding: 10px; background: #0f0f23; border-radius: 5px; }
                .key { color: #00ff88; font-weight: bold; }
                .value { color: #e0e0e0; }
                pre { background: #000; padding: 10px; border-radius: 5px; overflow-x: auto; }
              </style>
            </head>
            <body>
              <h2>🎯 XCLV Element Analysis Debug</h2>
              
              <div class="section">
                <h3>Element Details</h3>
                <p><span class="key">Tag:</span> <span class="value">${debugData.element.tagName}</span></p>
                <p><span class="key">ID:</span> <span class="value">${debugData.element.id || 'None'}</span></p>
                <p><span class="key">Classes:</span> <span class="value">${debugData.element.className || 'None'}</span></p>
                <p><span class="key">Text Length:</span> <span class="value">${text.length} characters</span></p>
              </div>
              
              <div class="section">
                <h3>Text Content</h3>
                <pre>${text}</pre>
              </div>
              
              <div class="section">
                <h3>Context</h3>
                <p><span class="key">Parent:</span> <span class="value">${debugData.context.parent}</span></p>
                <p><span class="key">Siblings:</span> <span class="value">${debugData.context.siblings}</span></p>
                <p><span class="key">URL:</span> <span class="value">${debugData.url}</span></p>
                <p><span class="key">Timestamp:</span> <span class="value">${debugData.timestamp}</span></p>
              </div>
              
              <div class="section">
                <h3>Raw HTML</h3>
                <pre>${debugData.element.innerHTML}</pre>
              </div>
            </body>
            </html>
          `);
          debugWindow.document.close();
        }
        
      } catch (error) {
        console.error('XCLV: Failed to show debug popup:', error);
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
      this.analysisOverlay.style.left = `${rect.left}px`;
      this.analysisOverlay.style.top = `${rect.bottom + 55}px`;
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
      this.analysisOverlay.style.left = `${rect.left}px`;
      this.analysisOverlay.style.top = `${rect.bottom + 55}px`;
      this.analysisOverlay.style.zIndex = '1000000';
      
      document.body.appendChild(this.analysisOverlay);
      
      // Auto-hide after 8 seconds
      setTimeout(() => this.hideAnalysisOverlay(), 8000);
      
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
            <small>Click to close • Auto-closes in 8s</small>
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
      this.analysisOverlay.style.left = `${rect.left}px`;
      this.analysisOverlay.style.top = `${rect.bottom + 55}px`;
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
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'xclvSlideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }

    cleanup() {
      this.hideAnalyzeButton();
      this.hideAnalysisOverlay();
      
      if (this.selectedElement) {
        this.deselectElement();
      }
      
      if (this.currentHoveredElement) {
        this.removeHighlight(this.currentHoveredElement);
        this.currentHoveredElement = null;
      }
      
      // Remove any remaining highlights and selections
      document.querySelectorAll('.xclv-highlighted').forEach(el => {
        this.removeHighlight(el);
      });
      
      document.querySelectorAll('.xclv-selected').forEach(el => {
        el.classList.remove('xclv-selected');
      });
    }
  };
}

// Main Content Controller Class
if (typeof window.XCLVContentController === 'undefined') {
  window.XCLVContentController = class XCLVContentController {
    constructor() {
      this.extractor = new window.ContentExtractor();
      this.analysisPanel = new window.AnalysisPanel();
      this.interactiveAnalyzer = new window.InteractiveContentAnalyzer();
      this.isAnalyzing = false;
      
      console.log('XCLV: Content Controller created v1.2.20');
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
            sendResponse({ success: true, message: 'Click-to-analyze mode activated' });
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
  };
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

    window.xclvController = new window.XCLVContentController();
    window.xclvController.initialize();
    console.log('XCLV: Content Controller initialized successfully v1.2.20');
  } catch (error) {
    console.error('XCLV: Failed to initialize Content Controller:', error);
    // Retry once after a delay
    setTimeout(() => {
      try {
        if (!window.xclvController) {
          window.xclvController = new window.XCLVContentController();
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

// Mark as loaded
console.log('XCLV: Content script v1.2.20 loaded successfully');

} // End of duplicate loading check
