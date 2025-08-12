// XCLV Brand Analysis Extension - Content Script
// Click-to-Analyze Interactive Mode v1.2.33

// Prevent duplicate loading and class redeclaration errors
if (window.xclvContentLoaded) {
  console.log('XCLV: Content script already loaded, skipping...');
  // Don't execute the rest of the file if already loaded
} else {
  window.xclvContentLoaded = true;
  console.log('XCLV: Content script loading v1.2.33...');

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
      try {
        // Enhanced intelligent content extraction for meaningful content only
        const meaningfulContent = this.extractMeaningfulContent();
        
        console.log('XCLV: Enhanced content extraction completed:', {
          contentLength: meaningfulContent.length,
          wordCount: meaningfulContent.split(' ').length
        });
        
        return meaningfulContent || this.fallbackExtraction();
      } catch (error) {
        console.error('XCLV: Enhanced extraction failed, using fallback:', error);
        return this.fallbackExtraction();
      }
    }

    extractMeaningfulContent() {
      const contentBlocks = [];
      
      // Priority 1: Semantic content containers (highest quality)
      const semanticSelectors = [
        'main', 'article', '[role="main"]', 
        '.post-content', '.entry-content', '.article-content',
        '.content', '.main-content', '#content'
      ];
      
      // Priority 2: Structured content blocks
      const structuredSelectors = [
        'section', '.section', 
        '.hero', '.hero-content',
        '.description', '.about',
        '.features', '.benefits'
      ];
      
      // Priority 3: Text-heavy elements
      const textSelectors = ['p', 'div', 'blockquote'];
      
      // Extract from semantic containers first
      this.extractFromSelectors(semanticSelectors, contentBlocks, 'semantic');
      
      // If we don't have enough content, try structured elements
      if (this.getTotalContentLength(contentBlocks) < 1000) {
        this.extractFromSelectors(structuredSelectors, contentBlocks, 'structured');
      }
      
      // If still not enough, carefully select text elements
      if (this.getTotalContentLength(contentBlocks) < 2000) {
        this.extractTextElements(textSelectors, contentBlocks);
      }
      
      // Add headlines for context
      this.addHeadlinesContext(contentBlocks);
      
      // Clean and combine content
      return this.processContentBlocks(contentBlocks);
    }

    extractFromSelectors(selectors, contentBlocks, type) {
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          if (this.isValidContentElement(element)) {
            const content = this.cleanElementContent(element);
            if (content && content.length >= 100) {
              contentBlocks.push({
                content: content,
                type: type,
                element: element.tagName.toLowerCase(),
                priority: type === 'semantic' ? 1 : 2
              });
            }
          }
        }
        // Stop if we have good semantic content
        if (type === 'semantic' && this.getTotalContentLength(contentBlocks) > 3000) {
          break;
        }
      }
    }

    extractTextElements(selectors, contentBlocks) {
      const processedElements = new Set();
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          // Avoid duplicates and nested processing
          if (processedElements.has(element) || this.isInsideProcessedElement(element, processedElements)) {
            continue;
          }
          
          if (this.isValidTextElement(element)) {
            const content = this.cleanElementContent(element);
            if (content && content.length >= 50) {
              contentBlocks.push({
                content: content,
                type: 'text',
                element: element.tagName.toLowerCase(),
                priority: 3
              });
              processedElements.add(element);
            }
          }
        }
        
        // Cap content extraction to avoid overwhelming analysis
        if (this.getTotalContentLength(contentBlocks) > 8000) {
          break;
        }
      }
    }

    addHeadlinesContext(contentBlocks) {
      const headlines = document.querySelectorAll('h1, h2, h3, h4');
      for (const headline of headlines) {
        const headlineText = headline.textContent.trim();
        if (headlineText.length > 10 && headlineText.length < 200) {
          contentBlocks.push({
            content: headlineText,
            type: 'headline',
            element: headline.tagName.toLowerCase(),
            priority: 0 // Highest priority for context
          });
        }
      }
    }

    isValidContentElement(element) {
      // Skip navigation, UI elements, and other non-content areas
      const skipSelectors = [
        'nav', 'header', 'footer', 'aside',
        '.nav', '.navigation', '.menu',
        '.sidebar', '.widget', '.advertisement',
        '.social', '.share', '.comments',
        '.cookie', '.banner', '.popup',
        '.breadcrumb', '.pagination',
        'script', 'style', 'noscript'
      ];
      
      // Check if element or its parents match skip patterns
      for (const skipSelector of skipSelectors) {
        if (element.matches && element.matches(skipSelector)) return false;
        if (element.closest && element.closest(skipSelector)) return false;
      }
      
      // Skip elements that are likely UI components
      const classList = element.className || '';
      const skipPatterns = ['btn', 'button', 'form', 'input', 'modal', 'overlay'];
      if (skipPatterns.some(pattern => classList.includes(pattern))) return false;
      
      return true;
    }

    isValidTextElement(element) {
      if (!this.isValidContentElement(element)) return false;
      
      const text = element.textContent.trim();
      
      // Skip short text blocks
      if (text.length < 50) return false;
      
      // Skip elements with too many links (likely navigation)
      const links = element.querySelectorAll('a').length;
      const words = text.split(' ').length;
      if (links > 0 && links / words > 0.3) return false;
      
      // Skip elements that look like lists of links
      const listItems = element.querySelectorAll('li').length;
      if (listItems > 3 && text.length / listItems < 30) return false;
      
      return true;
    }

    cleanElementContent(element) {
      if (!element) return '';
      
      // Create a clone to avoid modifying the original
      const clone = element.cloneNode(true);
      
      // Remove script and style elements
      const unwantedElements = clone.querySelectorAll('script, style, noscript');
      unwantedElements.forEach(el => el.remove());
      
      // Get text content and clean it
      let content = clone.textContent || '';
      
      // Clean up whitespace
      content = content.replace(/\s+/g, ' ').trim();
      
      // Remove common UI patterns
      content = content.replace(/^(Read more|Continue reading|Click here|Learn more)/i, '');
      content = content.replace(/(Home|About|Contact|Privacy|Terms)\s*$/i, '');
      
      return content;
    }

    isInsideProcessedElement(element, processedElements) {
      for (const processed of processedElements) {
        if (processed.contains(element)) return true;
      }
      return false;
    }

    getTotalContentLength(contentBlocks) {
      return contentBlocks.reduce((total, block) => total + block.content.length, 0);
    }

    processContentBlocks(contentBlocks) {
      // Sort by priority (headlines first, then semantic, structured, text)
      contentBlocks.sort((a, b) => a.priority - b.priority);
      
      // Deduplicate similar content
      const uniqueBlocks = this.deduplicateContent(contentBlocks);
      
      // Combine into final content string
      let finalContent = '';
      let totalLength = 0;
      
      for (const block of uniqueBlocks) {
        // Add spacing between different content types
        if (finalContent && block.type === 'headline') {
          finalContent += '\n\n';
        } else if (finalContent) {
          finalContent += ' ';
        }
        
        finalContent += block.content;
        totalLength += block.content.length;
        
        // Cap at reasonable length for API efficiency
        if (totalLength > 8000) break;
      }
      
      return finalContent.trim();
    }

    deduplicateContent(contentBlocks) {
      const uniqueBlocks = [];
      const seenContent = new Set();
      
      for (const block of contentBlocks) {
        // Create a normalized version for comparison
        const normalized = block.content.toLowerCase().replace(/\s+/g, ' ').trim();
        
        // Skip if we've seen very similar content
        let isDuplicate = false;
        for (const seen of seenContent) {
          if (this.calculateSimilarity(normalized, seen) > 0.8) {
            isDuplicate = true;
            break;
          }
        }
        
        if (!isDuplicate) {
          uniqueBlocks.push(block);
          seenContent.add(normalized);
        }
      }
      
      return uniqueBlocks;
    }

    calculateSimilarity(str1, str2) {
      const words1 = str1.split(' ');
      const words2 = str2.split(' ');
      const intersection = words1.filter(word => words2.includes(word));
      return intersection.length / Math.max(words1.length, words2.length);
    }

    fallbackExtraction() {
      // Simple fallback if enhanced extraction fails
      const fallbackSelectors = ['main', 'article', '.content'];
      for (const selector of fallbackSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const content = this.cleanElementContent(element);
          if (content && content.length > 100) {
            return content.substring(0, 5000); // Reasonable limit
          }
        }
      }
      
      // Last resort: body content (filtered)
      const bodyContent = this.cleanElementContent(document.body);
      return bodyContent ? bodyContent.substring(0, 3000) : '';
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
      this.debugMode = true; // Auto-enable debug mode
      this.debugWindow = null; // Reference to debug popup window
      this.pendingAnalysis = null; // Store pending analysis data
      
      console.log('XCLV: InteractiveContentAnalyzer initialized with click-to-analyze mode');
    }

    enable() {
      if (this.isHoverMode) {
        console.log('🔄 XCLV: Enable called but hover mode already active');
        return;
      }
      
      this.isHoverMode = true;
      this.setupMouseEvents();
      this.showModeNotification('Click-to-analyze mode enabled - hover to highlight, click to select');
      console.log('✅ XCLV: Click-to-analyze hover mode ENABLED - isHoverMode:', this.isHoverMode);
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

    // ENHANCED: Much more robust click handling with DEBUG
    handleClick(event) {
      console.log('🔍 XCLV: DETAILED Click event detected:', {
        target: event.target.tagName,
        targetClass: event.target.className,
        targetId: event.target.id,
        targetText: event.target.textContent?.substring(0, 50),
        isAnalyzableElement: this.isAnalyzableElement(event.target),
        isXCLVElement: this.isXCLVElement(event.target),
        isHoverMode: this.isHoverMode,
        isAnalyzing: this.isAnalyzing,
        eventPhase: event.eventPhase,
        bubbles: event.bubbles,
        cancelable: event.cancelable,
        currentSelectedElement: this.selectedElement?.tagName,
        analyzeButtonExists: !!this.analyzeButton
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
      console.log('🎯 XCLV: selectElement called for:', element.tagName, 'Text:', element.textContent?.substring(0, 50));
      this.selectedElement = element;
      
      // Add selection styling (different from hover)
      element.classList.add('xclv-selected');
      element.classList.remove('xclv-highlighted'); // Remove hover highlight
      
      console.log('🎯 XCLV: About to show analyze button...');
      // Show the analyze button attached to this element
      this.showAnalyzeButton(element);
      
      console.log('🎯 XCLV: Element selected and button creation attempted:', {
        tag: element.tagName,
        text: element.textContent.trim().substring(0, 50) + '...',
        hasClass: element.classList.contains('xclv-selected'),
        buttonCreated: !!this.analyzeButton
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

    // FIXED: Better element checking - highlighted elements should be clickable
    isXCLVElement(element) {
      try {
        // Check for null/undefined element
        if (!element) return false;
        
        // Check closest selectors for UI elements (these should be skipped)
        if (element.closest('#xclv-analysis-panel') ||
            element.closest('.xclv-analyze-btn-inline') ||
            element.closest('.xclv-analysis-overlay') ||
            element.closest('.xclv-mode-notification')) {
          return true;
        }
        
        // FIXED: Don't skip highlighted/selected elements - they should be clickable!
        // Only skip if it's our UI button or panel elements
        
        // Safe check for element.id and startsWith (skip our UI elements)
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

    // BULLETPROOF: Enhanced analyze button positioning with fallback strategies
    showAnalyzeButton(element) {
      console.log('🔨 XCLV: showAnalyzeButton called for:', element.tagName);
      console.log('🔨 XCLV: Element text:', element.textContent?.substring(0, 100));
      console.log('🔨 XCLV: Element visible:', this.isElementVisible(element));
      
      this.hideAnalyzeButton(); // Remove any existing button

      const rect = element.getBoundingClientRect();
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      console.log('🔨 XCLV: Element positioning data:', {
        rect: rect,
        scrollX: scrollX,
        scrollY: scrollY,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      });
      
      // Create button element
      this.analyzeButton = document.createElement('button');
      this.analyzeButton.className = 'xclv-analyze-btn-inline xclv-btn-selected';
      this.analyzeButton.innerHTML = '🔍 ANALYZE CONTENT';
      this.analyzeButton.title = 'Click to analyze this selected text element';
      
      // Button dimensions
      const buttonWidth = 160;
      const buttonHeight = 40;
      const padding = 10; // Safety margin from viewport edges
      
      // ENHANCED: Smart positioning with multiple fallback strategies
      let buttonX, buttonY;
      let positionStrategy = 'default';
      
      // Strategy 1: Below element (preferred)
      buttonX = rect.left;
      buttonY = rect.bottom + 8;
      
      // Check boundaries and adjust
      if (buttonX + buttonWidth > window.innerWidth - padding) {
        buttonX = window.innerWidth - buttonWidth - padding;
        positionStrategy = 'right-adjusted';
      }
      
      if (buttonX < padding) {
        buttonX = padding;
        positionStrategy = 'left-adjusted';
      }
      
      if (buttonY + buttonHeight > window.innerHeight - padding) {
        // Strategy 2: Above element
        buttonY = rect.top - buttonHeight - 8;
        positionStrategy = 'above';
        
        if (buttonY < padding) {
          // Strategy 3: Overlay on element (last resort)
          buttonY = rect.top + (rect.height - buttonHeight) / 2;
          buttonX = rect.left + rect.width + 8;
          positionStrategy = 'overlay-right';
          
          if (buttonX + buttonWidth > window.innerWidth - padding) {
            buttonX = rect.left - buttonWidth - 8;
            positionStrategy = 'overlay-left';
            
            if (buttonX < padding) {
              // Strategy 4: Center screen fallback
              buttonX = (window.innerWidth - buttonWidth) / 2;
              buttonY = (window.innerHeight - buttonHeight) / 2;
              positionStrategy = 'center-fallback';
            }
          }
        }
      }
      
      // Ensure positions are within bounds (final safety check)
      buttonX = Math.max(padding, Math.min(buttonX, window.innerWidth - buttonWidth - padding));
      buttonY = Math.max(padding, Math.min(buttonY, window.innerHeight - buttonHeight - padding));
      
      // Apply positioning
      this.analyzeButton.style.position = 'fixed';
      this.analyzeButton.style.left = `${buttonX}px`;
      this.analyzeButton.style.top = `${buttonY}px`;
      this.analyzeButton.style.zIndex = '999999';
      
      console.log('🔨 XCLV: Button positioning strategy:', positionStrategy);
      console.log('🔨 XCLV: Final button position:', { x: buttonX, y: buttonY });
      
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
      
      // Enhanced styling and visibility
      this.analyzeButton.style.display = 'block';
      this.analyzeButton.style.visibility = 'visible';
      this.analyzeButton.style.opacity = '1';
      this.analyzeButton.style.pointerEvents = 'auto';
      this.analyzeButton.style.cursor = 'pointer';
      
      // CRITICAL: Add visual debugging helper
      if (this.debugMode) {
        this.analyzeButton.style.boxShadow = '0 0 10px red'; // Temporary debug indicator
        console.log('🔨 XCLV: DEBUG MODE - Button has red glow for visibility');
      }
      
      // Add to DOM
      document.body.appendChild(this.analyzeButton);
      
      // ENHANCED: Comprehensive verification
      setTimeout(() => {
        if (this.analyzeButton && document.body.contains(this.analyzeButton)) {
          const buttonRect = this.analyzeButton.getBoundingClientRect();
          const isVisible = buttonRect.width > 0 && buttonRect.height > 0;
          const isInViewport = buttonRect.left >= 0 && 
                              buttonRect.top >= 0 && 
                              buttonRect.right <= window.innerWidth && 
                              buttonRect.bottom <= window.innerHeight;
          
          console.log('✅ XCLV: Button verification:', {
            exists: true,
            isVisible: isVisible,
            isInViewport: isInViewport,
            computedStyle: {
              display: window.getComputedStyle(this.analyzeButton).display,
              visibility: window.getComputedStyle(this.analyzeButton).visibility,
              opacity: window.getComputedStyle(this.analyzeButton).opacity,
              zIndex: window.getComputedStyle(this.analyzeButton).zIndex
            },
            finalRect: buttonRect,
            strategy: positionStrategy
          });
          
          if (!isVisible || !isInViewport) {
            console.error('❌ XCLV: Button positioning failed!', {
              isVisible, isInViewport, buttonRect, strategy: positionStrategy
            });
          } else {
            console.log('🎉 XCLV: Button successfully positioned and visible!');
          }
        } else {
          console.error('❌ XCLV: Button not found in DOM after creation');
        }
      }, 100);
    }

    // Button visibility checker utility
    verifyButtonVisibility() {
      if (this.analyzeButton) {
        const rect = this.analyzeButton.getBoundingClientRect();
        const style = window.getComputedStyle(this.analyzeButton);
        return {
          exists: document.body.contains(this.analyzeButton),
          visible: rect.width > 0 && rect.height > 0,
          inViewport: rect.left >= 0 && rect.top >= 0 && 
                     rect.right <= window.innerWidth && 
                     rect.bottom <= window.innerHeight,
          style: {
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            zIndex: style.zIndex
          }
        };
      }
      return { exists: false };
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

        // DON'T run analysis automatically - wait for user to click "RUN ANALYSIS" in debug popup
        console.log('🎯 XCLV: Element analysis prepared, waiting for user action in debug popup');
        
        // Show ready state
        this.showAnalysisOverlay(element, { ready: true });
        
        // Store analysis data for manual trigger
        this.pendingAnalysis = {
          text: text,
          element: element
        };
        
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

        // Create debug popup window with tabbed interface
        this.debugWindow = window.open('', 'xclv-debug', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        if (this.debugWindow) {
          this.debugWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>XCLV Debug - Element Analysis</title>
              <style>
                body { font-family: monospace; margin: 0; background: #1a1a2e; color: #fff; }
                .header { background: #2563eb; padding: 15px; color: white; border-bottom: 2px solid #00ff88; }
                .tabs { display: flex; background: #0f0f23; border-bottom: 1px solid #00ff88; }
                .tab { padding: 12px 20px; cursor: pointer; border-right: 1px solid #333; transition: background 0.2s; }
                .tab:hover { background: #333; }
                .tab.active { background: #00ff88; color: #000; font-weight: bold; }
                .content { padding: 20px; height: calc(100vh - 120px); overflow-y: auto; }
                .tab-panel { display: none; }
                .tab-panel.active { display: block; }
                .section { margin: 20px 0; padding: 15px; background: #0f0f23; border-radius: 8px; border: 1px solid #333; }
                .key { color: #00ff88; font-weight: bold; }
                .value { color: #e0e0e0; }
                pre { 
                  background: #000; 
                  padding: 15px; 
                  border-radius: 8px; 
                  overflow: auto; 
                  font-size: 12px; 
                  line-height: 1.4; 
                  max-height: 200px;
                  min-height: 120px;
                  word-wrap: break-word;
                  white-space: pre-wrap;
                }
                .loading { text-align: center; padding: 50px; color: #888; }
                .json-result { background: #0a0a0a; color: #00ff88; font-size: 13px; }
                
                /* ToV Slider Styles - Inspired by tooooools.app */
                .tov-container {
                  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
                  border-radius: 12px;
                  padding: 25px;
                  border: 1px solid rgba(0, 255, 136, 0.2);
                }
                
                .tov-loading, .tov-spinner {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 12px;
                  padding: 40px;
                  color: #888;
                  font-size: 13px;
                }
                
                .tov-spinner::before {
                  content: '';
                  width: 20px;
                  height: 20px;
                  border: 2px solid rgba(0, 255, 136, 0.2);
                  border-top: 2px solid #00ff88;
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
                }
                
                .tov-slider-group {
                  margin-bottom: 30px;
                }
                
                .tov-slider-item {
                  margin-bottom: 25px;
                }
                
                .tov-slider-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 12px;
                }
                
                .tov-slider-label {
                  font-family: 'Segoe UI', -apple-system, sans-serif;
                  font-size: 14px;
                  font-weight: 600;
                  color: #e0e8ea;
                  text-transform: capitalize;
                  letter-spacing: 0.5px;
                }
                
                .tov-slider-value {
                  font-family: 'JetBrains Mono', monospace;
                  font-size: 16px;
                  font-weight: 700;
                  color: #00ff88;
                  min-width: 40px;
                  text-align: right;
                }
                
                .tov-slider-track {
                  position: relative;
                  height: 8px;
                  background: linear-gradient(90deg, #2a2a3e 0%, #3a3a5e 100%);
                  border-radius: 6px;
                  margin: 8px 0;
                  overflow: hidden;
                  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
                }
                
                .tov-slider-fill {
                  height: 100%;
                  background: linear-gradient(90deg, #00ff88 0%, #00cc6a 100%);
                  border-radius: 6px;
                  position: relative;
                  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                  box-shadow: 0 0 8px rgba(0, 255, 136, 0.4);
                }
                
                .tov-slider-fill::after {
                  content: '';
                  position: absolute;
                  top: -2px;
                  right: -2px;
                  width: 12px;
                  height: 12px;
                  background: radial-gradient(circle, #ffffff 0%, #00ff88 100%);
                  border-radius: 50%;
                  box-shadow: 0 2px 6px rgba(0, 255, 136, 0.6);
                }
                
                .tov-slider-position {
                  font-size: 11px;
                  color: rgba(224, 232, 234, 0.7);
                  margin-top: 6px;
                  font-style: italic;
                  text-align: center;
                  background: rgba(0, 255, 136, 0.1);
                  padding: 4px 8px;
                  border-radius: 4px;
                  border: 1px solid rgba(0, 255, 136, 0.2);
                }
                
                .tov-brand-info {
                  background: rgba(0, 255, 136, 0.1);
                  border: 1px solid rgba(0, 255, 136, 0.3);
                  border-radius: 8px;
                  padding: 15px;
                  margin-bottom: 20px;
                }
                
                .tov-brand-name {
                  font-size: 18px;
                  font-weight: 700;
                  color: #00ff88;
                  margin-bottom: 8px;
                  text-align: center;
                }
                
                .tov-brand-personality {
                  font-size: 13px;
                  line-height: 1.5;
                  color: #e0e8ea;
                  text-align: center;
                  font-style: italic;
                }
                
                .tov-section-title {
                  font-size: 16px;
                  font-weight: 600;
                  color: #00ff88;
                  margin: 25px 0 15px 0;
                  padding-bottom: 8px;
                  border-bottom: 1px solid rgba(0, 255, 136, 0.3);
                  text-align: center;
                }
                
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                
                @keyframes slideIn {
                  0% { 
                    opacity: 0; 
                    transform: translateY(20px);
                  }
                  100% { 
                    opacity: 1; 
                    transform: translateY(0);
                  }
                }
                
                .tov-slider-item {
                  animation: slideIn 0.6s ease-out forwards;
                }
                
                .tov-slider-item:nth-child(1) { animation-delay: 0.1s; }
                .tov-slider-item:nth-child(2) { animation-delay: 0.2s; }
                .tov-slider-item:nth-child(3) { animation-delay: 0.3s; }
                .tov-slider-item:nth-child(4) { animation-delay: 0.4s; }
                .tov-slider-item:nth-child(5) { animation-delay: 0.5s; }
              </style>
            </head>
            <body>
              <div class="header">
                <h2 style="margin: 0;">🎯 XCLV Element Analysis Debug</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.8;">${debugData.element.tagName} - ${text.substring(0, 100)}...</p>
              </div>

              <div class="tabs">
                <div class="tab active" data-tab="element-tab">Element</div>
                <div class="tab" data-tab="content-tab">Content</div>
                <div class="tab" data-tab="context-tab">Context</div>
                <div class="tab" data-tab="tov-tab">ToV</div>
                <div class="tab" data-tab="results-tab">Results</div>
              </div>

              <div class="content">
                <div id="element-tab" class="tab-panel active">
                  <div class="section">
                    <h3>Element Details</h3>
                    <p><span class="key">Tag:</span> <span class="value">${debugData.element.tagName}</span></p>
                    <p><span class="key">ID:</span> <span class="value">${debugData.element.id || 'None'}</span></p>
                    <p><span class="key">Classes:</span> <span class="value">${debugData.element.className || 'None'}</span></p>
                    <p><span class="key">Text Length:</span> <span class="value">${text.length} characters</span></p>
                  </div>
                  
                  <div class="section">
                    <h3>Raw HTML</h3>
                    <pre>${debugData.element.innerHTML}</pre>
                  </div>
                </div>

                <div id="content-tab" class="tab-panel">
                  <div class="section">
                    <h3>Analyzed Text Content</h3>
                    <pre>${text}</pre>
                  </div>
                </div>

                <div id="context-tab" class="tab-panel">
                  <div class="section">
                    <h3>Page Context</h3>
                    <p><span class="key">URL:</span> <span class="value">${debugData.url}</span></p>
                    <p><span class="key">Timestamp:</span> <span class="value">${debugData.timestamp}</span></p>
                    <p><span class="key">Parent:</span> <span class="value">${debugData.context.parent}</span></p>
                    <p><span class="key">Siblings:</span> <span class="value">${debugData.context.siblings}</span></p>
                  </div>
                </div>

                <div id="tov-tab" class="tab-panel">
                  <div class="section">
                    <h3>🎨 Tone of Voice Analysis</h3>
                    <div id="tov-visualization" class="tov-container">
                      <div class="tov-loading">
                        <div class="tov-spinner"></div>
                        <span>Run analysis to see Tone of Voice visualization</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="results-tab" class="tab-panel">
                  <div class="section">
                    <h3>🎯 Analysis Control Panel</h3>
                    <div style="margin: 15px 0;">
                      <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" id="tov-analysis-checkbox" checked style="margin-right: 10px;">
                        <span class="value">Tone of Voice Analysis</span>
                      </label>
                    </div>
                    <div style="margin: 15px 0;">
                      <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" id="brand-archetypes-checkbox" style="margin-right: 10px;">
                        <span class="value">Brand Archetypes Mix</span>
                      </label>
                    </div>
                    <button id="run-analysis-btn" style="
                      background: #00ff88; 
                      color: #000; 
                      border: none; 
                      padding: 10px 20px; 
                      border-radius: 5px; 
                      cursor: pointer; 
                      font-weight: bold;
                      font-size: 14px;
                      margin: 10px 0;">
                      🚀 RUN ANALYSIS
                    </button>
                  </div>
                  
                  <div class="section" id="debug-status">
                    <h3>📊 Debug Status</h3>
                    <div id="debug-log" style="
                      background: #000; 
                      padding: 10px; 
                      border-radius: 5px; 
                      font-family: monospace; 
                      font-size: 11px; 
                      line-height: 1.3;
                      max-height: 150px;
                      overflow-y: auto;">
                      ✅ Ready - Click "RUN ANALYSIS" to start
                    </div>
                  </div>
                  
                  <div class="section" id="analysis-results" style="display: none;">
                    <h3>✅ Analysis Results</h3>
                    <div id="results-content"></div>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `);
          this.debugWindow.document.close();
          
          // Add event listeners for tabs (CSP-compliant way) - with delay to ensure DOM is ready
          setTimeout(() => {
            this.setupDebugPopupTabs();
          }, 100);
        }
        
      } catch (error) {
        console.error('XCLV: Failed to show debug popup:', error);
      }
    }

    setupDebugPopupTabs() {
      try {
        if (!this.debugWindow || this.debugWindow.closed) {
          console.log('XCLV: Debug window not available for tab setup');
          return;
        }
        
        const tabs = this.debugWindow.document.querySelectorAll('.tab');
        console.log('XCLV: Found', tabs.length, 'tabs to setup');
        
        tabs.forEach((tab, index) => {
          console.log('XCLV: Setting up tab', index, tab.getAttribute('data-tab'));
          tab.addEventListener('click', (event) => {
            event.preventDefault();
            const targetTab = tab.getAttribute('data-tab');
            console.log('XCLV: Tab clicked:', targetTab);
            this.showDebugTab(targetTab);
          });
        });
        
        // Setup RUN ANALYSIS button
        const runAnalysisBtn = this.debugWindow.document.getElementById('run-analysis-btn');
        if (runAnalysisBtn) {
          runAnalysisBtn.addEventListener('click', () => {
            console.log('XCLV: Run Analysis button clicked');
            this.runManualAnalysis();
          });
          console.log('XCLV: Run Analysis button event listener attached');
        }
        
        console.log('XCLV: Tab event listeners setup complete');
        
      } catch (error) {
        console.error('XCLV: Failed to setup debug popup tabs:', error);
      }
    }

    showDebugTab(tabName) {
      try {
        if (!this.debugWindow || this.debugWindow.closed) {
          console.log('XCLV: Debug window not available for tab switch');
          return;
        }
        
        console.log('XCLV: Switching to tab:', tabName);
        
        // Hide all panels
        const panels = this.debugWindow.document.querySelectorAll('.tab-panel');
        console.log('XCLV: Found', panels.length, 'panels');
        panels.forEach(p => p.classList.remove('active'));
        
        // Remove active from all tabs
        const tabs = this.debugWindow.document.querySelectorAll('.tab');
        console.log('XCLV: Found', tabs.length, 'tab buttons');
        tabs.forEach(t => t.classList.remove('active'));
        
        // Show selected panel
        const targetPanel = this.debugWindow.document.getElementById(tabName);
        if (targetPanel) {
          targetPanel.classList.add('active');
          console.log('XCLV: Activated panel:', tabName);
        } else {
          console.log('XCLV: Panel not found:', tabName);
        }
        
        // Make tab active
        const targetTab = this.debugWindow.document.querySelector(`[data-tab="${tabName}"]`);
        if (targetTab) {
          targetTab.classList.add('active');
          console.log('XCLV: Activated tab button:', tabName);
        } else {
          console.log('XCLV: Tab button not found:', tabName);
        }
        
      } catch (error) {
        console.error('XCLV: Failed to show debug tab:', error);
      }
    }

    async runManualAnalysis() {
      try {
        console.log('🚀 XCLV: Starting manual analysis');
        
        if (!this.pendingAnalysis) {
          this.logToDebugPopup('❌ Error: No pending analysis data');
          return;
        }

        if (!this.debugWindow || this.debugWindow.closed) {
          console.log('XCLV: Debug window not available');
          return;
        }

        // Check which analyses are selected
        const tovCheckbox = this.debugWindow.document.getElementById('tov-analysis-checkbox');
        const archetypesCheckbox = this.debugWindow.document.getElementById('brand-archetypes-checkbox');
        
        const tovSelected = tovCheckbox && tovCheckbox.checked;
        const archetypesSelected = archetypesCheckbox && archetypesCheckbox.checked;
        
        if (!tovSelected && !archetypesSelected) {
          this.logToDebugPopup('⚠️ Please select at least one analysis type');
          return;
        }

        const { text, element } = this.pendingAnalysis;

        // Log selected analyses
        const selectedAnalyses = [];
        if (tovSelected) selectedAnalyses.push('Tone of Voice');
        if (archetypesSelected) selectedAnalyses.push('Brand Archetypes');
        
        this.logToDebugPopup(`🔍 Starting Analysis: ${selectedAnalyses.join(' + ')}`);
        this.logToDebugPopup(`📝 Content: ${text.substring(0, 100)}...`);
        this.logToDebugPopup(`🏷️ Element: ${element.tagName}`);
        this.logToDebugPopup(`📏 Content length: ${text.length} characters`);
        
        // Warn about very long content
        if (text.length > 2000) {
          this.logToDebugPopup('⚠️ Warning: Long content may hit token limits');
        }
        
        // Update button state
        const runBtn = this.debugWindow.document.getElementById('run-analysis-btn');
        if (runBtn) {
          runBtn.disabled = true;
          runBtn.textContent = '⏳ ANALYZING...';
          runBtn.style.background = '#666';
        }

        this.isAnalyzing = true;
        
        // Check cache first
        if (this.analysisCache.has(text)) {
          this.logToDebugPopup('⚡ Using cached result');
          const cachedResult = this.analysisCache.get(text);
          this.displayAnalysisResults(cachedResult);
          this.resetRunButton();
          return;
        }

        // Send analysis request with debugging
        this.logToDebugPopup('📡 Sending API request to Gemini...');
        const startTime = Date.now();
        
        // Run analyses based on selections
        let response;
        if (tovSelected && archetypesSelected) {
          // Run both analyses
          this.logToDebugPopup('🔄 Running dual analysis...');
          try {
            const [tovResponse, archetypesResponse] = await Promise.all([
              this.sendAnalysisRequest(text, element, 'tone-of-voice'),
              this.sendAnalysisRequest(text, element, 'brand-archetypes')
            ]);
            this.logToDebugPopup('✅ Both analyses completed');
            this.logToDebugPopup(`ToV Success: ${tovResponse?.success}, Archetypes Success: ${archetypesResponse?.success}`);
            response = this.combineAnalysisResults(tovResponse, archetypesResponse);
          } catch (error) {
            this.logToDebugPopup(`❌ Dual analysis error: ${error.message}`);
            throw error;
          }
        } else if (tovSelected) {
          response = await this.sendAnalysisRequest(text, element, 'tone-of-voice');
        } else if (archetypesSelected) {
          response = await this.sendAnalysisRequest(text, element, 'brand-archetypes');
        }
        
        const duration = Date.now() - startTime;
        this.logToDebugPopup(`⏱️ API call completed in ${duration}ms`);
        
        if (response && response.success) {
          this.logToDebugPopup('✅ Analysis successful!');
          this.logToDebugPopup(`🤖 Model: ${response.metadata?.model || 'Unknown'}`);
          
          this.analysisCache.set(text, response.data);
          this.displayAnalysisResults(response);
          this.showAnalysisResult(element, response.data);
        } else {
          const errorMsg = response?.error || 'Unknown error';
          this.logToDebugPopup(`❌ Analysis failed: ${errorMsg}`);
          
          // Handle specific errors with suggestions
          if (errorMsg.includes('MAX_TOKENS')) {
            this.logToDebugPopup('💡 Solution 1: Switch to Gemini 2.5 Pro in extension settings');
            this.logToDebugPopup('💡 Solution 2: Try analyzing shorter text elements');
            this.logToDebugPopup('💡 Solution 3: Content may be too complex for Flash model');
          } else if (errorMsg.includes('API key')) {
            this.logToDebugPopup('💡 Suggestion: Check API key in extension settings');
          } else if (errorMsg.includes('quota') || errorMsg.includes('QUOTA')) {
            this.logToDebugPopup('💡 Suggestion: API quota exceeded. Check Google AI Studio');
          } else if (errorMsg.includes('safety') || errorMsg.includes('SAFETY')) {
            this.logToDebugPopup('💡 Suggestion: Content flagged by safety filters');
          }
          
          this.showAnalysisResult(element, { error: errorMsg });
        }
        
      } catch (error) {
        console.error('XCLV: Manual analysis failed:', error);
        this.logToDebugPopup(`💥 Error: ${error.message}`);
      } finally {
        this.isAnalyzing = false;
        this.resetRunButton();
      }
    }

    resetRunButton() {
      if (!this.debugWindow || this.debugWindow.closed) return;
      
      const runBtn = this.debugWindow.document.getElementById('run-analysis-btn');
      if (runBtn) {
        runBtn.disabled = false;
        runBtn.textContent = '🚀 RUN ANALYSIS';
        runBtn.style.background = '#00ff88';
      }
    }

    logToDebugPopup(message) {
      try {
        console.log('XCLV Debug:', message);
        
        if (!this.debugWindow || this.debugWindow.closed) return;
        
        const debugLog = this.debugWindow.document.getElementById('debug-log');
        if (debugLog) {
          const timestamp = new Date().toLocaleTimeString();
          debugLog.innerHTML += `\n[${timestamp}] ${message}`;
          debugLog.scrollTop = debugLog.scrollHeight;
        }
      } catch (error) {
        console.error('XCLV: Failed to log to debug popup:', error);
      }
    }

    displayAnalysisResults(response) {
      try {
        if (!this.debugWindow || this.debugWindow.closed) return;

        const resultsSection = this.debugWindow.document.getElementById('analysis-results');
        const resultsContent = this.debugWindow.document.getElementById('results-content');
        
        if (!resultsSection || !resultsContent) return;

        // Update ToV visualization if tone analysis data is available
        this.updateTovVisualization(response);

        // Check if it's a combined analysis
        const isCombined = response.metadata?.analysisType === 'combined';
        
        let resultsHTML = '';
        
        if (isCombined) {
          // Combined analysis display
          resultsHTML = `
            <div style="margin-bottom: 15px;">
              <div class="key">Analysis Type:</div>
              <div class="value">Combined (ToV + Brand Archetypes)</div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <div class="key">ToV Model:</div>
              <div class="value">${response.metadata?.tovModel || 'Unknown'}</div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <div class="key">Archetypes Model:</div>
              <div class="value">${response.metadata?.archetypesModel || 'Unknown'}</div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <div class="key">🎯 Tone of Voice Results:</div>
              <pre class="json-result">${JSON.stringify(response.data.toneOfVoice, null, 2)}</pre>
            </div>
            
            <div style="margin-bottom: 20px;">
              <div class="key">🏛️ Brand Archetypes Results:</div>
              <pre class="json-result">${JSON.stringify(response.data.brandArchetypes, null, 2)}</pre>
            </div>
            
            <div style="margin-bottom: 15px;">
              <div class="key">System Prompts:</div>
              <pre style="max-height: 200px; overflow-y: auto;">${response.systemPrompt || 'No system prompts available'}</pre>
            </div>
          `;
        } else {
          // Single analysis display
          const analysisTypeIcon = response.metadata?.promptType === 'brand-archetype-analysis' ? '🏛️' : '🎯';
          const analysisTypeName = response.metadata?.promptType === 'brand-archetype-analysis' ? 'Brand Archetypes' : 'Tone of Voice';
          
          resultsHTML = `
            <div style="margin-bottom: 15px;">
              <div class="key">Analysis Type:</div>
              <div class="value">${analysisTypeIcon} ${analysisTypeName}</div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <div class="key">Model:</div>
              <div class="value">${response.metadata?.model || 'Unknown'}</div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <div class="key">Results:</div>
              <pre class="json-result">${JSON.stringify(response.data, null, 2)}</pre>
            </div>
            
            <div style="margin-bottom: 15px;">
              <div class="key">System Prompt:</div>
              <pre style="max-height: 150px; overflow-y: auto;">${response.systemPrompt || 'No system prompt available'}</pre>
            </div>
          `;
        }

        resultsContent.innerHTML = resultsHTML;
        resultsSection.style.display = 'block';
        
        this.logToDebugPopup('📊 Results displayed in popup');
        
      } catch (error) {
        console.error('XCLV: Failed to display analysis results:', error);
      }
    }

    updateTovVisualization(response) {
      try {
        if (!this.debugWindow || this.debugWindow.closed) return;

        const tovVisualization = this.debugWindow.document.getElementById('tov-visualization');
        if (!tovVisualization) return;

        // Extract ToV data from various possible response structures
        let tovData = null;
        let brandName = 'Unknown Brand';
        let brandPersonality = '';

        // Try different response structures
        if (response.metadata?.analysisType === 'combined') {
          tovData = response.data?.toneOfVoice?.tone_analysis || response.data?.toneOfVoice;
          brandName = response.data?.toneOfVoice?.brand_name || brandName;
          brandPersonality = response.data?.toneOfVoice?.tone_analysis?.brand_personality || '';
        } else if (response.data?.tone_analysis) {
          tovData = response.data.tone_analysis;
          brandName = response.data.brand_name || brandName;
          brandPersonality = response.data.tone_analysis.brand_personality || '';
        } else if (response.data?.formality) {
          // Direct tone analysis structure
          tovData = response.data;
          brandPersonality = response.data.brand_personality || '';
        }

        if (!tovData) {
          tovVisualization.innerHTML = `
            <div class="tov-loading">
              <span>No Tone of Voice data available in this analysis</span>
            </div>
          `;
          return;
        }

        // Create the beautiful slider visualization
        const tovHTML = this.buildTovSliderHTML(tovData, brandName, brandPersonality);
        tovVisualization.innerHTML = tovHTML;

        // Animate sliders after a brief delay
        setTimeout(() => {
          this.animateTovSliders();
          // Auto-switch to ToV tab to show the beautiful visualization
          this.showDebugTab('tov-tab');
        }, 100);

        this.logToDebugPopup('🎨 ToV visualization updated');

      } catch (error) {
        console.error('XCLV: Failed to update ToV visualization:', error);
        const tovVisualization = this.debugWindow.document.getElementById('tov-visualization');
        if (tovVisualization) {
          tovVisualization.innerHTML = `
            <div class="tov-loading">
              <span>Error loading ToV visualization</span>
            </div>
          `;
        }
      }
    }

    buildTovSliderHTML(tovData, brandName, brandPersonality) {
      // Standard ToV dimensions
      const dimensions = [
        { key: 'formality', label: 'Formality' },
        { key: 'warmth', label: 'Warmth' },
        { key: 'authority', label: 'Authority' },
        { key: 'authenticity', label: 'Authenticity' },
        { key: 'innovation', label: 'Innovation' }
      ];

      let slidersHTML = '';

      // Build sliders for each dimension
      dimensions.forEach((dimension, index) => {
        const data = tovData[dimension.key];
        if (data) {
          const score = data.score || 0;
          const position = data.position || 'Unknown';
          const evidence = data.evidence || '';

          slidersHTML += `
            <div class="tov-slider-item" style="opacity: 0;">
              <div class="tov-slider-header">
                <div class="tov-slider-label">${dimension.label}</div>
                <div class="tov-slider-value">${score}</div>
              </div>
              <div class="tov-slider-track">
                <div class="tov-slider-fill" style="width: ${score}%;"></div>
              </div>
              <div class="tov-slider-position">${position}</div>
            </div>
          `;
        }
      });

      return `
        <div class="tov-brand-info">
          <div class="tov-brand-name">${brandName}</div>
          ${brandPersonality ? `<div class="tov-brand-personality">${brandPersonality}</div>` : ''}
        </div>
        
        <div class="tov-section-title">Tone of Voice Dimensions</div>
        
        <div class="tov-slider-group">
          ${slidersHTML}
        </div>
      `;
    }

    animateTovSliders() {
      try {
        if (!this.debugWindow || this.debugWindow.closed) return;

        const sliderItems = this.debugWindow.document.querySelectorAll('.tov-slider-item');
        
        sliderItems.forEach((item, index) => {
          setTimeout(() => {
            item.style.opacity = '1';
            
            // Trigger the fill animation by resetting and then setting the width
            const fillElement = item.querySelector('.tov-slider-fill');
            if (fillElement) {
              const targetWidth = fillElement.style.width;
              fillElement.style.width = '0%';
              
              // Use requestAnimationFrame to ensure the 0% is applied before animating
              requestAnimationFrame(() => {
                setTimeout(() => {
                  fillElement.style.width = targetWidth;
                }, 50);
              });
            }
          }, index * 200); // Stagger animations by 200ms
        });

        this.logToDebugPopup('✨ ToV sliders animated');

      } catch (error) {
        console.error('XCLV: Failed to animate ToV sliders:', error);
      }
    }

    updateDebugPopupWithResults(response) {
      try {
        if (!this.debugWindow || this.debugWindow.closed) return;

        const resultsTab = this.debugWindow.document.getElementById('results-tab');
        if (!resultsTab) return;

        const resultsHTML = `
          <div class="section">
            <h3>✅ Analysis Complete</h3>
            <p><span class="key">Model:</span> <span class="value">${response.metadata?.model || 'Unknown'}</span></p>
            <p><span class="key">Prompt Type:</span> <span class="value">${response.metadata?.promptType || 'Unknown'}</span></p>
            <p><span class="key">Timestamp:</span> <span class="value">${response.metadata?.timestamp || 'Unknown'}</span></p>
          </div>
          
          <div class="section">
            <h3>🎯 Analysis Results</h3>
            <pre class="json-result">${JSON.stringify(response.data, null, 2)}</pre>
          </div>
          
          <div class="section">
            <h3>📝 System Prompt</h3>
            <pre>${response.systemPrompt || 'No system prompt available'}</pre>
          </div>
          
          <div class="section">
            <h3>📊 Request Data</h3>
            <pre class="json-result">${JSON.stringify(response.parsedContent, null, 2)}</pre>
          </div>
        `;

        resultsTab.innerHTML = resultsHTML;
        
        // Auto-switch to results tab using the new method
        this.showDebugTab('results-tab');
        
      } catch (error) {
        console.error('XCLV: Failed to update debug popup with results:', error);
      }
    }

    async sendAnalysisRequest(text, element, analysisType = 'tone-of-voice') {
      return new Promise((resolve, reject) => {
        try {
          chrome.runtime.sendMessage({
            action: 'analyzeTextElement',
            data: {
              text: text,
              analysisType: analysisType, // Add analysis type
              element: {
                tagName: element.tagName.toLowerCase(),
                className: element.className,
                id: element.id,
                textLength: text.length
              },
              page: {
                title: document.title,
                url: window.location.href
              },
              context: this.getElementContext(element)
            }
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error(`XCLV: ${analysisType} analysis error:`, chrome.runtime.lastError);
              resolve({
                success: false,
                error: chrome.runtime.lastError.message,
                metadata: { analysisType: analysisType }
              });
            } else {
              console.log(`XCLV: ${analysisType} analysis response:`, response);
              resolve(response || {
                success: false,
                error: 'Empty response',
                metadata: { analysisType: analysisType }
              });
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    }

    combineAnalysisResults(tovResponse, archetypesResponse) {
      try {
        console.log('XCLV: Combining analysis results');
        console.log('ToV Response:', tovResponse);
        console.log('Archetypes Response:', archetypesResponse);
        
        // Ensure we have valid response objects
        if (!tovResponse || !archetypesResponse) {
          throw new Error('Missing response objects');
        }
        
        const combined = {
          success: tovResponse.success && archetypesResponse.success,
          data: {
            toneOfVoice: tovResponse.data || null,
            brandArchetypes: archetypesResponse.data || null
          },
          metadata: {
            ...(tovResponse.metadata || {}),
            analysisType: 'combined',
            tovModel: tovResponse.metadata?.model || 'Unknown',
            archetypesModel: archetypesResponse.metadata?.model || 'Unknown'
          }
        };
        
        if (tovResponse.systemPrompt || archetypesResponse.systemPrompt) {
          combined.systemPrompt = `TOV PROMPT:\n${tovResponse.systemPrompt || 'None'}\n\nARCHETYPES PROMPT:\n${archetypesResponse.systemPrompt || 'None'}`;
        }
        
        if (!combined.success) {
          combined.error = `TOV: ${tovResponse.error || 'OK'} | Archetypes: ${archetypesResponse.error || 'OK'}`;
        }
        
        console.log('XCLV: Combined result:', combined);
        return combined;
      } catch (error) {
        console.error('XCLV: Error combining results:', error);
        return {
          success: false,
          error: `Failed to combine results: ${error.message}`,
          data: null,
          metadata: {
            analysisType: 'combined'
          }
        };
      }
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
      } else if (data.ready) {
        this.analysisOverlay.innerHTML = `
          <div class="xclv-overlay-content">
            <div class="xclv-ready">
              <span>🎯 Ready for analysis</span>
              <br>
              <small>Use debug popup to run analysis</small>
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
      
      console.log('XCLV: Content Controller created v1.2.30');
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
        
        console.log('XCLV: Enhanced content extraction - length:', mainText.length);
        console.log('XCLV: Content preview:', mainText.substring(0, 200) + '...');
        
        if (!mainText || mainText.length < 50) {
          throw new Error('Insufficient content for analysis');
        }
        
        // Use the new modular analysis pipeline
        const contentData = {
          text: mainText,
          metadata: content.metadata,
          headlines: content.headlines,
          extractionStats: {
            contentLength: mainText.length,
            wordCount: mainText.split(' ').length,
            headlinesCount: content.headlines.length,
            extractionEngine: 'enhanced-v2'
          }
        };
        
        console.log('XCLV: Starting modular analysis pipeline...');
        const analysisResult = await this.analyzeWithPrompts(contentData);
        
        if (analysisResult) {
          this.extractor.analysisData = analysisResult;
          console.log('XCLV: Modular analysis completed successfully');
          return { success: true, data: analysisResult };
        } else {
          throw new Error('Modular analysis pipeline failed');
        }
        
      } catch (error) {
        console.error('XCLV: Analysis failed:', error);
        this.isAnalyzing = false;
        return { success: false, error: error.message };
      }
    }

    async analyzeWithPrompts(contentData, selectedPrompts = null) {
        try {
            if (!contentData) {
                throw new Error('No content data provided for analysis');
            }

            // Use dynamic prompt loading system
            const promptsToUse = selectedPrompts || await this.getAvailablePrompts();
            
            // Create modular analysis requests
            const analysisRequests = this.createAnalysisRequests(contentData, promptsToUse);
            
            console.log(`XCLV: Created ${analysisRequests.length} analysis requests`);

            // Execute modular analysis pipeline
            const results = await this.executeAnalysisPipeline(analysisRequests);

            return this.combineAnalysisResults(results);

        } catch (error) {
            console.error('XCLV: Modular analysis failed:', error);
            throw error;
        }
    }

    async getAvailablePrompts() {
        try {
            // Request available prompts from background script
            const response = await this.sendMessageSafely({
                action: 'getAvailablePrompts'
            });

            if (response && response.success) {
                console.log('XCLV: Loaded', Object.keys(response.prompts).length, 'dynamic prompts');
                return response.prompts;
            } else {
                // Fallback to default prompts if dynamic loading fails
                console.warn('XCLV: Dynamic prompt loading failed, using defaults');
                return this.getDefaultPrompts();
            }
        } catch (error) {
            console.error('XCLV: Failed to get available prompts:', error);
            return this.getDefaultPrompts();
        }
    }

    getDefaultPrompts() {
        // Fallback prompts for backward compatibility
        return {
            'tone-of-voice': 'Analyze the tone of voice and brand personality of this content',
            'brand-archetypes': 'Identify the brand archetypes present in this content'
        };
    }

    createAnalysisRequests(contentData, prompts) {
        const requests = [];
        
        // Create individual analysis requests for each prompt module
        Object.entries(prompts).forEach(([promptName, promptContent]) => {
            requests.push({
                id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                module: promptName,
                prompt: promptContent,
                content: contentData,
                url: window.location.href,
                timestamp: Date.now()
            });
        });

        return requests;
    }

    async executeAnalysisPipeline(analysisRequests) {
        const results = [];
        const maxConcurrent = 2; // Limit concurrent requests to avoid rate limits
        
        // Process requests in batches
        for (let i = 0; i < analysisRequests.length; i += maxConcurrent) {
            const batch = analysisRequests.slice(i, i + maxConcurrent);
            
            console.log(`XCLV: Processing batch ${Math.ceil((i + 1) / maxConcurrent)}/${Math.ceil(analysisRequests.length / maxConcurrent)}...`);
            
            // Execute batch concurrently
            const batchPromises = batch.map(request => this.executeAnalysisRequest(request));
            const batchResults = await Promise.allSettled(batchPromises);
            
            // Process results
            batchResults.forEach((result, index) => {
                const request = batch[index];
                if (result.status === 'fulfilled' && result.value.success) {
                    results.push({
                        module: request.module,
                        id: request.id,
                        data: result.value.data,
                        timestamp: request.timestamp,
                        processingTime: Date.now() - request.timestamp
                    });
                } else {
                    console.warn(`XCLV: Analysis module '${request.module}' failed:`, result.reason || result.value?.error);
                    // Add failed result for debugging
                    results.push({
                        module: request.module,
                        id: request.id,
                        error: result.reason || result.value?.error,
                        timestamp: request.timestamp,
                        processingTime: Date.now() - request.timestamp
                    });
                }
            });
            
            // Small delay between batches to be respectful to API
            if (i + maxConcurrent < analysisRequests.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        return results;
    }

    async executeAnalysisRequest(request) {
        try {
            const response = await this.sendMessageSafely({
                action: 'analyzeContent',
                data: {
                    content: request.content,
                    url: request.url,
                    prompt: request.prompt,
                    module: request.module,
                    requestId: request.id
                }
            });

            return response || { success: false, error: 'No response received' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    combineAnalysisResults(results) {
        const combined = {
            timestamp: Date.now(),
            url: window.location.href,
            totalModules: results.length,
            successfulModules: results.filter(r => !r.error).length,
            failedModules: results.filter(r => r.error).length,
            totalProcessingTime: results.reduce((sum, r) => sum + r.processingTime, 0),
            modules: {},
            metadata: {
                analysisVersion: '2.0.0-modular',
                contentExtractionEngine: 'enhanced-v2',
                pipelineType: 'modular-concurrent'
            }
        };

        // Organize results by module
        results.forEach(result => {
            combined.modules[result.module] = {
                success: !result.error,
                data: result.data,
                error: result.error,
                processingTime: result.processingTime,
                timestamp: result.timestamp,
                id: result.id
            };
        });

        // Maintain backward compatibility with existing result structure
        const successfulResults = results.filter(r => !r.error);
        if (successfulResults.length > 0) {
            // Find tone analysis result for backward compatibility
            const toneResult = successfulResults.find(r => 
                r.module.toLowerCase().includes('tone') || 
                r.data?.tone_analysis
            );
            
            if (toneResult && toneResult.data) {
                combined.tone_analysis = toneResult.data.tone_analysis || toneResult.data;
                combined.brand_name = toneResult.data.brand_name || 'Unknown';
            }
            
            // Find archetype analysis for backward compatibility
            const archetypeResult = successfulResults.find(r => 
                r.module.toLowerCase().includes('archetype') || 
                r.data?.archetype_analysis
            );
            
            if (archetypeResult && archetypeResult.data) {
                combined.archetype_analysis = archetypeResult.data.archetype_analysis || archetypeResult.data;
            }
            
            // Find recommendations for backward compatibility
            const recommendationsResult = successfulResults.find(r => 
                r.module.toLowerCase().includes('recommendation') || 
                r.data?.recommendations
            );
            
            if (recommendationsResult && recommendationsResult.data) {
                combined.recommendations = recommendationsResult.data.recommendations || recommendationsResult.data;
            }
        }

        console.log('XCLV: Combined analysis results:', {
            totalModules: combined.totalModules,
            successful: combined.successfulModules,
            failed: combined.failedModules,
            processingTime: `${combined.totalProcessingTime}ms`
        });

        return combined;
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
    console.log('XCLV: Content Controller initialized successfully v1.2.30');
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
console.log('XCLV: Content script v1.2.30 loaded successfully');

} // End of duplicate loading check
