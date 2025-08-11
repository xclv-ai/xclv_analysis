// XCLV Brand Analysis - Content Script
// Real-time Brand Intelligence Interface

class WebContentExtractor {
  extractPageContent() {
    return {
      mainContent: this.extractMainContent(),
      headlines: this.extractHeadlines(),
      callToActions: this.extractCTAs(),
      navigation: this.extractNavigation(),
      metadata: this.extractMetadata(),
      brandElements: this.extractBrandElements()
    };
  }

  extractMainContent() {
    const contentSelectors = [
      'main', 'article', '[role="main"]',
      '.content', '.main-content', '#content',
      '.post-content', '.entry-content', '.page-content'
    ];
    
    let mainContent = '';
    
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        mainContent = this.getCleanText(element);
        break;
      }
    }
    
    // Fallback: extract from body, excluding nav/footer
    if (!mainContent) {
      const body = document.body.cloneNode(true);
      const excludeSelectors = ['nav', 'header', 'footer', '.nav', '.header', '.footer', 'script', 'style'];
      excludeSelectors.forEach(sel => {
        const elements = body.querySelectorAll(sel);
        elements.forEach(el => el.remove());
      });
      mainContent = this.getCleanText(body);
    }
    
    return mainContent;
  }

  extractHeadlines() {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(el => ({
        text: el.textContent.trim(),
        level: el.tagName.toLowerCase(),
        position: this.getElementPosition(el),
        context: this.getElementContext(el)
      }))
      .filter(h => h.text.length > 0);
  }

  extractCTAs() {
    const ctaSelectors = [
      'button', 'a[href]', 'input[type="submit"]', 'input[type="button"]',
      '.btn', '.button', '.cta', '.call-to-action'
    ];
    
    const ctas = [];
    
    ctaSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        const text = el.textContent.trim() || el.value || el.getAttribute('aria-label');
        if (text && text.length > 0 && text.length < 100) {
          ctas.push({
            text: text,
            type: el.tagName.toLowerCase(),
            href: el.href || null,
            position: this.getElementPosition(el),
            classes: el.className
          });
        }
      });
    });
    
    return ctas;
  }

  extractNavigation() {
    const navElements = document.querySelectorAll('nav, .nav, .navigation, .menu');
    const navigation = [];
    
    navElements.forEach(nav => {
      const links = nav.querySelectorAll('a');
      links.forEach(link => {
        const text = link.textContent.trim();
        if (text && text.length > 0) {
          navigation.push({
            text: text,
            href: link.href,
            section: 'navigation'
          });
        }
      });
    });
    
    return navigation;
  }

  extractMetadata() {
    return {
      title: document.title,
      description: this.getMetaContent('description'),
      keywords: this.getMetaContent('keywords'),
      ogTitle: this.getMetaContent('og:title'),
      ogDescription: this.getMetaContent('og:description'),
      url: window.location.href,
      domain: window.location.hostname
    };
  }

  extractBrandElements() {
    return {
      logos: this.findLogos(),
      brandColors: this.extractBrandColors(),
      typography: this.extractTypography(),
      brandMentions: this.findBrandMentions()
    };
  }

  findLogos() {
    const logoSelectors = [
      '.logo', '#logo', '[class*="logo"]', '[id*="logo"]',
      'img[alt*="logo"]', 'img[src*="logo"]'
    ];
    
    const logos = [];
    logoSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (el.tagName === 'IMG') {
          logos.push({
            type: 'image',
            src: el.src,
            alt: el.alt
          });
        } else {
          logos.push({
            type: 'element',
            text: el.textContent.trim(),
            html: el.innerHTML
          });
        }
      });
    });
    
    return logos;
  }

  extractBrandColors() {
    const colorRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|rgb\([^)]+\)|rgba\([^)]+\)/g;
    const colors = new Set();
    
    // Extract from CSS
    const stylesheets = Array.from(document.styleSheets);
    stylesheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule.style) {
            const cssText = rule.style.cssText;
            const matches = cssText.match(colorRegex);
            if (matches) {
              matches.forEach(color => colors.add(color));
            }
          }
        });
      } catch (e) {
        // Cross-origin stylesheets might not be accessible
      }
    });
    
    return Array.from(colors).slice(0, 10); // Limit to top 10 colors
  }

  extractTypography() {
    const headings = document.querySelectorAll('h1, h2, h3');
    const paragraphs = document.querySelectorAll('p');
    
    const getFontInfo = (element) => {
      const styles = window.getComputedStyle(element);
      return {
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        lineHeight: styles.lineHeight
      };
    };
    
    return {
      headings: headings.length > 0 ? getFontInfo(headings[0]) : null,
      body: paragraphs.length > 0 ? getFontInfo(paragraphs[0]) : null
    };
  }

  findBrandMentions() {
    const domain = window.location.hostname.replace(/^www\./, '');
    const brandName = domain.split('.')[0];
    
    const text = document.body.textContent.toLowerCase();
    const mentions = [];
    
    // Simple brand name detection
    if (text.includes(brandName.toLowerCase())) {
      mentions.push({
        term: brandName,
        frequency: (text.match(new RegExp(brandName.toLowerCase(), 'g')) || []).length
      });
    }
    
    return mentions;
  }

  getCleanText(element) {
    // Clone to avoid modifying original
    const clone = element.cloneNode(true);
    
    // Remove scripts, styles, and other non-content elements
    const excludeTags = ['script', 'style', 'nav', 'header', 'footer', 'aside'];
    excludeTags.forEach(tag => {
      const elements = clone.getElementsByTagName(tag);
      Array.from(elements).forEach(el => el.remove());
    });
    
    return clone.textContent.replace(/\s+/g, ' ').trim();
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

  getElementContext(element) {
    const tagName = element.tagName.toLowerCase();
    const classes = element.className || '';
    const id = element.id || '';
    
    // Determine section context
    let section = 'body';
    const header = element.closest('header, nav, .header, .navigation');
    const main = element.closest('main, .main, .content');
    const footer = element.closest('footer, .footer');
    
    if (header) section = 'header/navigation';
    else if (footer) section = 'footer';
    else if (main) section = 'main content';

    return {
      elementType: tagName,
      section: section,
      classes: classes,
      id: id
    };
  }

  getMetaContent(name) {
    const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    return meta ? meta.getAttribute('content') : null;
  }
}

class TextAnalysisOverlay {
  constructor() {
    this.activeOverlay = null;
    this.analysisCache = new Map();
    this.isEnabled = false;
    this.debounceTimer = null;
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
    this.mouseoverHandler = (e) => {
      if (!this.isEnabled) return;
      
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        if (this.shouldAnalyzeElement(e.target)) {
          this.showAnalysisOverlay(e.target, e);
        }
      }, 300);
    };

    this.mouseoutHandler = (e) => {
      if (!this.isEnabled) return;
      
      clearTimeout(this.debounceTimer);
      setTimeout(() => {
        if (this.activeOverlay && !this.activeOverlay.contains(e.relatedTarget)) {
          this.hideAnalysisOverlay();
        }
      }, 100);
    };

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
    clearTimeout(this.debounceTimer);
  }

  shouldAnalyzeElement(element) {
    const text = element.textContent.trim();
    
    // Skip if text too short or too long
    if (text.length < 10 || text.length > 500) return false;
    
    // Skip if element is inside existing overlay
    if (element.closest('.xclv-analysis-overlay, .xclv-analysis-panel')) return false;
    
    // Skip if element has no meaningful text
    if (!/[a-zA-Z]/.test(text)) return false;
    
    // Skip navigation and structural elements
    if (element.closest('nav, .nav, script, style, code, pre')) return false;
    
    return true;
  }

  async showAnalysisOverlay(element, event) {
    const text = element.textContent.trim();
    
    // Check cache first
    let analysis = this.analysisCache.get(text);
    if (!analysis) {
      try {
        analysis = await this.analyzeElementClarity(element);
        this.analysisCache.set(text, analysis);
      } catch (error) {
        console.error('Analysis failed:', error);
        return;
      }
    }

    this.createOverlay(element, analysis);
  }

  async analyzeElementClarity(element) {
    const text = element.textContent.trim();
    const context = this.getElementContext(element);
    
    // Simple local analysis for quick feedback
    const wordCount = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);
    
    // Calculate basic clarity score
    let clarityScore = 100;
    
    // Penalize overly long sentences
    if (avgWordsPerSentence > 20) clarityScore -= 20;
    else if (avgWordsPerSentence > 15) clarityScore -= 10;
    
    // Penalize overly complex words
    const complexWords = text.split(/\s+/).filter(word => word.length > 12).length;
    const complexityRatio = complexWords / wordCount;
    if (complexityRatio > 0.2) clarityScore -= 15;
    
    // Bonus for action words (CTAs)
    const actionWords = ['get', 'start', 'try', 'buy', 'learn', 'discover', 'join', 'sign up'];
    const hasActionWords = actionWords.some(word => text.toLowerCase().includes(word));
    if (hasActionWords && context.elementType === 'button') clarityScore += 10;
    
    const insights = [];
    
    if (avgWordsPerSentence > 20) {
      insights.push({
        type: 'improvement',
        message: 'Consider shorter sentences for better readability'
      });
    }
    
    if (complexityRatio > 0.2) {
      insights.push({
        type: 'improvement',
        message: 'Simplify complex words for broader appeal'
      });
    }
    
    if (hasActionWords) {
      insights.push({
        type: 'positive',
        message: 'Clear action-oriented language'
      });
    }
    
    if (clarityScore >= 80) {
      insights.push({
        type: 'positive',
        message: 'Excellent clarity and readability'
      });
    }
    
    return {
      clarityScore: Math.max(0, Math.min(100, clarityScore)),
      comprehensionLevel: clarityScore >= 80 ? 'immediate' : clarityScore >= 60 ? 'quick' : 'slow',
      actionPotential: hasActionWords ? 'high' : 'medium',
      quickInsights: insights,
      effectiveness: clarityScore >= 80 ? 'high' : clarityScore >= 60 ? 'medium' : 'low'
    };
  }

  createOverlay(element, analysis) {
    this.hideAnalysisOverlay(); // Hide any existing overlay

    const overlay = document.createElement('div');
    overlay.className = 'xclv-analysis-overlay';
    
    const effectivenessClass = analysis.effectiveness;
    const clarityClass = analysis.clarityScore >= 80 ? 'excellent' : 
                         analysis.clarityScore >= 60 ? 'good' : 
                         analysis.clarityScore >= 40 ? 'fair' : 'poor';

    overlay.innerHTML = `
      <div class="clarity-score ${clarityClass}">
        <span class="score-value">${analysis.clarityScore}</span>
        <span class="score-label">Clarity</span>
      </div>
      <div class="quick-insights">
        ${analysis.quickInsights.map(insight => 
          `<div class="insight ${insight.type}">${insight.message}</div>`
        ).join('')}
      </div>
      <div class="effectiveness-badge ${effectivenessClass}">
        ${effectivenessClass.toUpperCase()} IMPACT
      </div>
    `;

    // Position the overlay
    this.positionOverlay(overlay, element);
    
    document.body.appendChild(overlay);
    this.activeOverlay = overlay;

    // Auto-hide after 4 seconds
    setTimeout(() => this.hideAnalysisOverlay(), 4000);
  }

  positionOverlay(overlay, element) {
    const rect = element.getBoundingClientRect();
    const overlayHeight = 150; // Approximate overlay height
    const spacing = 10;
    
    // Determine if overlay should appear above or below
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    let top, arrowClass;
    
    if (spaceBelow >= overlayHeight + spacing) {
      // Position below
      top = rect.bottom + window.scrollY + spacing;
      arrowClass = 'below';
    } else if (spaceAbove >= overlayHeight + spacing) {
      // Position above
      top = rect.top + window.scrollY - overlayHeight - spacing;
      arrowClass = 'above';
    } else {
      // Position below anyway (will extend off screen)
      top = rect.bottom + window.scrollY + spacing;
      arrowClass = 'below';
    }
    
    let left = rect.left + window.scrollX;
    
    // Ensure overlay doesn't go off screen horizontally
    const overlayWidth = 300; // Approximate overlay width
    if (left + overlayWidth > window.innerWidth) {
      left = window.innerWidth - overlayWidth - 20;
    }
    if (left < 20) {
      left = 20;
    }
    
    overlay.style.left = `${left}px`;
    overlay.style.top = `${top}px`;
    overlay.classList.add(arrowClass);
  }

  hideAnalysisOverlay() {
    if (this.activeOverlay) {
      this.activeOverlay.remove();
      this.activeOverlay = null;
    }
  }

  getElementContext(element) {
    const tagName = element.tagName.toLowerCase();
    const classes = element.className || '';
    const id = element.id || '';
    
    let section = 'body';
    const header = element.closest('header, nav, .header, .navigation');
    const main = element.closest('main, .main, .content');
    const footer = element.closest('footer, .footer');
    
    if (header) section = 'header/navigation';
    else if (footer) section = 'footer';
    else if (main) section = 'main content';

    return {
      elementType: tagName,
      section: section,
      classes: classes,
      id: id
    };
  }
}

class BrandAnalysisUI {
  constructor() {
    this.panel = null;
    this.isAnalyzing = false;
    this.currentAnalysis = null;
    this.isVisible = false;
    this.isMinimized = false;
    this.currentTab = 'overview';
  }

  initialize() {
    this.createAnalysisPanel();
    this.attachEventListeners();
  }

  createAnalysisPanel() {
    if (this.panel) return;

    const panel = document.createElement('div');
    panel.className = 'xclv-analysis-panel';
    panel.innerHTML = `
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
        <div class="analysis-actions">
          <button class="action-btn primary analyze-btn">Analyze Page</button>
          <button class="action-btn secondary export-btn">Export Report</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    this.panel = panel;
  }

  buildOverviewUI() {
    return `
      <div class="overview-section">
        <div class="brand-score-card">
          <div class="score-display">
            <div class="score-number" id="overall-score">--</div>
            <div class="score-label">Overall Brand Score</div>
          </div>
          <div class="score-breakdown">
            <div class="mini-metric">
              <span class="metric-label">Clarity</span>
              <span class="metric-value" id="clarity-score">--</span>
            </div>
            <div class="mini-metric">
              <span class="metric-label">Consistency</span>
              <span class="metric-value" id="consistency-score">--</span>
            </div>
            <div class="mini-metric">
              <span class="metric-label">Impact</span>
              <span class="metric-value" id="impact-score">--</span>
            </div>
          </div>
        </div>
        
        <div class="quick-insights-panel">
          <h4>Key Insights</h4>
          <div class="insights-list" id="overview-insights">
            <div class="insight-placeholder">Run analysis to see insights</div>
          </div>
        </div>
        
        <div class="page-summary">
          <h4>Page Summary</h4>
          <div class="summary-stats">
            <div class="stat">
              <span class="stat-label">Headlines</span>
              <span class="stat-value" id="headlines-count">--</span>
            </div>
            <div class="stat">
              <span class="stat-label">CTAs</span>
              <span class="stat-value" id="ctas-count">--</span>
            </div>
            <div class="stat">
              <span class="stat-label">Word Count</span>
              <span class="stat-value" id="word-count">--</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  buildToneAnalysisUI() {
    return `
      <div class="tone-analysis-section">
        <div class="tone-metrics">
          <div class="metric-card">
            <h4>Formality</h4>
            <div class="meter" data-metric="formality">
              <div class="meter-fill"></div>
            </div>
            <span class="metric-value">--</span>
          </div>
          
          <div class="metric-card">
            <h4>Warmth</h4>
            <div class="meter" data-metric="warmth">
              <div class="meter-fill"></div>
            </div>
            <span class="metric-value">--</span>
          </div>
          
          <div class="metric-card">
            <h4>Authority</h4>
            <div class="meter" data-metric="authority">
              <div class="meter-fill"></div>
            </div>
            <span class="metric-value">--</span>
          </div>

          <div class="metric-card">
            <h4>Authenticity</h4>
            <div class="meter" data-metric="authenticity">
              <div class="meter-fill"></div>
            </div>
            <span class="metric-value">--</span>
          </div>

          <div class="metric-card">
            <h4>Innovation</h4>
            <div class="meter" data-metric="innovation">
              <div class="meter-fill"></div>
            </div>
            <span class="metric-value">--</span>
          </div>
        </div>
        
        <div class="brand-personality">
          <h4>Brand Personality</h4>
          <div class="personality-description" id="brand-personality">
            Run tone analysis to see brand personality assessment
          </div>
        </div>
        
        <div class="recommendations-section">
          <h4>Tone Recommendations</h4>
          <ul class="recommendations-list" id="tone-recommendations">
            <li class="recommendation-placeholder">Analysis pending...</li>
          </ul>
        </div>
      </div>
    `;
  }

  buildArchetypeAnalysisUI() {
    return `
      <div class="archetype-analysis-section">
        <div class="archetype-grid">
          ${this.buildArchetypeCards()}
        </div>
        
        <div class="archetype-summary">
          <div class="primary-archetype">
            <h4>Primary Archetype</h4>
            <div class="archetype-result" id="primary-archetype">
              <span class="archetype-name">Analysis pending...</span>
              <span class="archetype-score">--</span>
            </div>
          </div>
          
          <div class="archetype-alignment">
            <h4>Brand Alignment</h4>
            <div class="alignment-description" id="archetype-alignment">
              Run archetype analysis to see alignment assessment
            </div>
          </div>
        </div>
        
        <div class="recommendations-section">
          <h4>Archetype Recommendations</h4>
          <ul class="recommendations-list" id="archetype-recommendations">
            <li class="recommendation-placeholder">Analysis pending...</li>
          </ul>
        </div>
      </div>
    `;
  }

  buildArchetypeCards() {
    const archetypes = [
      { name: 'Hero', icon: '⚔️', id: 'hero' },
      { name: 'Sage', icon: '🦉', id: 'sage' },
      { name: 'Explorer', icon: '🗺️', id: 'explorer' },
      { name: 'Innocent', icon: '🌟', id: 'innocent' },
      { name: 'Ruler', icon: '👑', id: 'ruler' },
      { name: 'Creator', icon: '🎨', id: 'creator' },
      { name: 'Caregiver', icon: '🤗', id: 'caregiver' },
      { name: 'Magician', icon: '✨', id: 'magician' },
      { name: 'Lover', icon: '💝', id: 'lover' },
      { name: 'Jester', icon: '🎭', id: 'jester' },
      { name: 'Everyman', icon: '👥', id: 'everyman' },
      { name: 'Outlaw', icon: '🏴‍☠️', id: 'outlaw' }
    ];

    return archetypes.map(archetype => `
      <div class="archetype-card" data-archetype="${archetype.id}">
        <div class="archetype-icon">${archetype.icon}</div>
        <div class="archetype-name">${archetype.name}</div>
        <div class="archetype-score">--</div>
      </div>
    `).join('');
  }

  attachEventListeners() {
    if (!this.panel) return;

    // Tab switching
    this.panel.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.getAttribute('data-tab');
        this.switchTab(tabName);
      });
    });

    // Panel controls
    const minimizeBtn = this.panel.querySelector('.minimize-btn');
    const closeBtn = this.panel.querySelector('.close-btn');
    const analyzeBtn = this.panel.querySelector('.analyze-btn');
    const exportBtn = this.panel.querySelector('.export-btn');

    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => this.toggleMinimize());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => this.runAnalysis());
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportReport());
    }

    // Make panel draggable
    this.makeDraggable();
  }

  switchTab(tabName) {
    // Remove active class from all tabs and content
    this.panel.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
    });
    this.panel.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    // Add active class to selected tab and content
    const selectedTab = this.panel.querySelector(`[data-tab="${tabName}"]`);
    const selectedContent = this.panel.querySelector(`#${tabName}-content`);

    if (selectedTab) selectedTab.classList.add('active');
    if (selectedContent) selectedContent.classList.add('active');

    this.currentTab = tabName;
  }

  show() {
    if (this.panel) {
      this.panel.classList.add('visible');
      this.isVisible = true;
    }
  }

  hide() {
    if (this.panel) {
      this.panel.classList.remove('visible');
      this.isVisible = false;
    }
  }

  toggleMinimize() {
    if (this.panel) {
      this.panel.classList.toggle('minimized');
      this.isMinimized = !this.isMinimized;
      
      const minimizeBtn = this.panel.querySelector('.minimize-btn');
      if (minimizeBtn) {
        minimizeBtn.textContent = this.isMinimized ? '+' : '−';
      }
    }
  }

  makeDraggable() {
    const header = this.panel.querySelector('.panel-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('panel-controls') || e.target.closest('.panel-controls')) {
        return;
      }
      
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      
      if (e.target === header || header.contains(e.target)) {
        isDragging = true;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        
        xOffset = currentX;
        yOffset = currentY;
        
        this.panel.style.transform = `translate(${currentX}px, calc(-50% + ${currentY}px))`;
      }
    });

    document.addEventListener('mouseup', () => {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
    });
  }

  async runAnalysis() {
    if (this.isAnalyzing) return;

    this.isAnalyzing = true;
    this.updateAnalyzingState(true);

    try {
      // Extract page content
      const extractor = new WebContentExtractor();
      const pageContent = extractor.extractPageContent();
      
      // Update page summary immediately
      this.updatePageSummary(pageContent);
      
      // Send analysis request to background script
      const result = await this.requestAnalysis(pageContent);
      
      if (result.success) {
        this.currentAnalysis = result.data;
        this.updateAnalysisResults(result.data);
      } else {
        this.showError(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      this.showError('Analysis temporarily unavailable');
    } finally {
      this.isAnalyzing = false;
      this.updateAnalyzingState(false);
    }
  }

  requestAnalysis(pageContent) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'analyzeContent',
        data: {
          text: pageContent.mainContent,
          url: window.location.href,
          metadata: pageContent.metadata,
          headlines: pageContent.headlines,
          ctas: pageContent.callToActions
        }
      }, (response) => {
        resolve(response || { success: false, error: 'No response received' });
      });
    });
  }

  updatePageSummary(pageContent) {
    const headlinesCount = document.getElementById('headlines-count');
    const ctasCount = document.getElementById('ctas-count');
    const wordCount = document.getElementById('word-count');

    if (headlinesCount) {
      headlinesCount.textContent = pageContent.headlines.length;
    }
    if (ctasCount) {
      ctasCount.textContent = pageContent.callToActions.length;
    }
    if (wordCount) {
      const words = pageContent.mainContent.split(/\s+/).length;
      wordCount.textContent = words.toLocaleString();
    }
  }

  updateAnalysisResults(analysis) {
    if (analysis.tone) {
      this.updateToneResults(analysis.tone);
    }
    if (analysis.archetypes) {
      this.updateArchetypeResults(analysis.archetypes);
    }
    this.updateOverviewResults(analysis);
  }

  updateToneResults(toneData) {
    // Update tone meters
    if (toneData.scores) {
      Object.keys(toneData.scores).forEach(metric => {
        const meter = this.panel.querySelector(`[data-metric="${metric}"] .meter-fill`);
        const value = this.panel.querySelector(`[data-metric="${metric}"]`).nextElementSibling;
        
        if (meter && value) {
          const score = toneData.scores[metric];
          meter.style.width = `${score}%`;
          value.textContent = score;
        }
      });
    }

    // Update brand personality
    const personalityEl = document.getElementById('brand-personality');
    if (personalityEl && toneData.brandPersonality) {
      personalityEl.textContent = toneData.brandPersonality;
    }

    // Update recommendations
    const recommendationsEl = document.getElementById('tone-recommendations');
    if (recommendationsEl && toneData.recommendations) {
      recommendationsEl.innerHTML = toneData.recommendations.map(rec => 
        `<li class="recommendation-item">${rec.insight}</li>`
      ).join('');
    }
  }

  updateArchetypeResults(archetypeData) {
    // Update archetype cards
    if (archetypeData.scores) {
      Object.keys(archetypeData.scores).forEach(archetype => {
        const card = this.panel.querySelector(`[data-archetype="${archetype}"]`);
        if (card) {
          const scoreEl = card.querySelector('.archetype-score');
          const score = archetypeData.scores[archetype].score || 0;
          if (scoreEl) scoreEl.textContent = score;
          
          // Highlight primary archetype
          if (archetypeData.primaryArchetype && 
              archetypeData.primaryArchetype.name === archetype) {
            card.classList.add('primary');
          }
        }
      });
    }

    // Update primary archetype display
    const primaryEl = document.getElementById('primary-archetype');
    if (primaryEl && archetypeData.primaryArchetype) {
      const nameEl = primaryEl.querySelector('.archetype-name');
      const scoreEl = primaryEl.querySelector('.archetype-score');
      
      if (nameEl) nameEl.textContent = archetypeData.primaryArchetype.name;
      if (scoreEl) scoreEl.textContent = archetypeData.primaryArchetype.score;
    }

    // Update alignment assessment
    const alignmentEl = document.getElementById('archetype-alignment');
    if (alignmentEl && archetypeData.archetypeAlignment) {
      alignmentEl.textContent = archetypeData.archetypeAlignment;
    }

    // Update recommendations
    const recommendationsEl = document.getElementById('archetype-recommendations');
    if (recommendationsEl && archetypeData.recommendations) {
      recommendationsEl.innerHTML = archetypeData.recommendations.map(rec => 
        `<li class="recommendation-item">${rec.implementation}</li>`
      ).join('');
    }
  }

  updateOverviewResults(analysis) {
    // Calculate overall score
    let overallScore = 70; // Base score
    
    if (analysis.tone && analysis.tone.scores) {
      const toneAvg = Object.values(analysis.tone.scores).reduce((a, b) => a + b, 0) / 5;
      overallScore = Math.round((overallScore + toneAvg) / 2);
    }

    // Update scores
    const overallScoreEl = document.getElementById('overall-score');
    const clarityScoreEl = document.getElementById('clarity-score');
    const consistencyScoreEl = document.getElementById('consistency-score');
    const impactScoreEl = document.getElementById('impact-score');

    if (overallScoreEl) overallScoreEl.textContent = overallScore;
    if (clarityScoreEl) clarityScoreEl.textContent = overallScore - 5;
    if (consistencyScoreEl) consistencyScoreEl.textContent = overallScore + 3;
    if (impactScoreEl) impactScoreEl.textContent = overallScore - 2;

    // Update key insights
    const insightsEl = document.getElementById('overview-insights');
    if (insightsEl) {
      const insights = [];
      
      if (analysis.tone && analysis.tone.dominantTone) {
        insights.push(`Dominant tone: ${analysis.tone.dominantTone}`);
      }
      
      if (analysis.archetypes && analysis.archetypes.primaryArchetype) {
        insights.push(`Primary archetype: ${analysis.archetypes.primaryArchetype.name}`);
      }

      if (insights.length > 0) {
        insightsEl.innerHTML = insights.map(insight => 
          `<div class="insight-item">${insight}</div>`
        ).join('');
      }
    }
  }

  updateAnalyzingState(isAnalyzing) {
    const analyzeBtn = this.panel.querySelector('.analyze-btn');
    if (!analyzeBtn) return;

    if (isAnalyzing) {
      analyzeBtn.innerHTML = 'Analyzing... <span class="loading-spinner"></span>';
      analyzeBtn.disabled = true;
      this.panel.classList.add('analyzing-state');
    } else {
      analyzeBtn.innerHTML = 'Analyze Page';
      analyzeBtn.disabled = false;
      this.panel.classList.remove('analyzing-state');
    }
  }

  showError(message) {
    // Create temporary error message
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    errorEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      z-index: 10003;
      font-family: inherit;
    `;

    document.body.appendChild(errorEl);
    setTimeout(() => errorEl.remove(), 3000);
  }

  exportReport() {
    if (!this.currentAnalysis) {
      this.showError('No analysis data to export');
      return;
    }

    const report = {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      analysis: this.currentAnalysis
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brand-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

class LiveBrandScoreboard {
  constructor() {
    this.scoreboard = null;
    this.isVisible = false;
    this.currentScores = {
      overall: 0,
      clarity: 0,
      consistency: 0,
      emotion: 0,
      archetype: 0
    };
  }

  initialize() {
    this.createScoreboard();
  }

  createScoreboard() {
    if (this.scoreboard) return;

    const scoreboard = document.createElement('div');
    scoreboard.className = 'brand-scoreboard';
    scoreboard.innerHTML = `
      <div class="scoreboard-header">
        <h3>Live Brand Score</h3>
        <div class="overall-score">
          <span class="score-number" id="live-overall-score">--</span>
          <span class="score-label">Overall</span>
        </div>
      </div>
      
      <div class="score-metrics">
        <div class="score-metric">
          <span class="metric-name">Clarity</span>
          <span class="metric-score" id="live-clarity">--</span>
        </div>
        <div class="score-metric">
          <span class="metric-name">Consistency</span>
          <span class="metric-score" id="live-consistency">--</span>
        </div>
        <div class="score-metric">
          <span class="metric-name">Impact</span>
          <span class="metric-score" id="live-impact">--</span>
        </div>
      </div>
    `;

    document.body.appendChild(scoreboard);
    this.scoreboard = scoreboard;
  }

  show() {
    if (this.scoreboard) {
      this.scoreboard.classList.add('visible');
      this.isVisible = true;
    }
  }

  hide() {
    if (this.scoreboard) {
      this.scoreboard.classList.remove('visible');
      this.isVisible = false;
    }
  }

  updateScores(analysis) {
    if (!this.scoreboard || !analysis) return;

    // Calculate scores from analysis
    let overallScore = 70;
    
    if (analysis.tone && analysis.tone.scores) {
      const toneAvg = Object.values(analysis.tone.scores).reduce((a, b) => a + b, 0) / 5;
      overallScore = Math.round(toneAvg);
    }

    this.currentScores = {
      overall: overallScore,
      clarity: overallScore - 3,
      consistency: overallScore + 2,
      impact: overallScore - 1
    };

    // Update UI
    const overallEl = document.getElementById('live-overall-score');
    const clarityEl = document.getElementById('live-clarity');
    const consistencyEl = document.getElementById('live-consistency');
    const impactEl = document.getElementById('live-impact');

    if (overallEl) overallEl.textContent = this.currentScores.overall;
    if (clarityEl) clarityEl.textContent = this.currentScores.clarity;
    if (consistencyEl) consistencyEl.textContent = this.currentScores.consistency;
    if (impactEl) impactEl.textContent = this.currentScores.impact;
  }
}

// Main Extension Controller
class XCLVBrandAnalysis {
  constructor() {
    this.contentExtractor = new WebContentExtractor();
    this.textOverlay = new TextAnalysisOverlay();
    this.analysisUI = new BrandAnalysisUI();
    this.scoreboard = new LiveBrandScoreboard();
    this.isActive = false;
  }

  initialize() {
    // Load and inject styles
    this.injectStyles();
    
    // Initialize UI components
    this.analysisUI.initialize();
    this.scoreboard.initialize();
    
    // Listen for messages from popup/background
    this.setupMessageListeners();
    
    console.log('XCLV Brand Analysis initialized');
  }

  injectStyles() {
    if (document.getElementById('xclv-styles')) return;

    const link = document.createElement('link');
    link.id = 'xclv-styles';
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('content-styles.css');
    document.head.appendChild(link);
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'toggleAnalysis':
          this.toggleAnalysis();
          break;
        case 'startAnalysis':
          this.startAnalysis();
          break;
        case 'stopAnalysis':
          this.stopAnalysis();
          break;
        case 'showPanel':
          this.analysisUI.show();
          break;
        case 'hidePanel':
          this.analysisUI.hide();
          break;
      }
    });
  }

  toggleAnalysis() {
    if (this.isActive) {
      this.stopAnalysis();
    } else {
      this.startAnalysis();
    }
  }

  startAnalysis() {
    this.isActive = true;
    this.textOverlay.enable();
    this.analysisUI.show();
    this.scoreboard.show();
    
    // Auto-run analysis
    setTimeout(() => {
      this.analysisUI.runAnalysis();
    }, 500);
  }

  stopAnalysis() {
    this.isActive = false;
    this.textOverlay.disable();
    this.analysisUI.hide();
    this.scoreboard.hide();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const xclv = new XCLVBrandAnalysis();
    xclv.initialize();
  });
} else {
  const xclv = new XCLVBrandAnalysis();
  xclv.initialize();
}