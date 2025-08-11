  // UPDATED: Show analyze button that stays attached to selected element
  showAnalyzeButton(element) {
    this.hideAnalyzeButton(); // Remove any existing button

    const rect = element.getBoundingClientRect();
    
    this.analyzeButton = document.createElement('button');
    this.analyzeButton.className = 'xclv-analyze-btn-inline xclv-btn-selected';
    this.analyzeButton.innerHTML = '🔍 ANALYZE CONTENT';
    this.analyzeButton.title = 'Click to analyze this selected text element';
    
    // Position the button next to the element - FIXED POSITIONING
    this.analyzeButton.style.position = 'fixed';
    this.analyzeButton.style.left = `${rect.left}px`;
    this.analyzeButton.style.top = `${rect.bottom + 8}px`;
    this.analyzeButton.style.zIndex = '999999';
    
    // Ensure button stays in viewport - IMPROVED LOGIC
    const buttonWidth = 160; // Approximate button width
    const buttonHeight = 40; // Approximate button height
    
    // Adjust horizontal position if would go off screen
    if (rect.left + buttonWidth > window.innerWidth) {
      this.analyzeButton.style.left = `${window.innerWidth - buttonWidth - 10}px`;
    }
    
    // Adjust vertical position if would go off screen
    if (rect.bottom + buttonHeight > window.innerHeight) {
      this.analyzeButton.style.top = `${rect.top - buttonHeight - 8}px`;
    }
    
    // Force display and visibility
    this.analyzeButton.style.display = 'block';
    this.analyzeButton.style.visibility = 'visible';
    this.analyzeButton.style.opacity = '1';
    
    document.body.appendChild(this.analyzeButton);
    
    console.log('XCLV: Analyze button created and attached:', {
      element: element.tagName,
      buttonRect: {
        left: this.analyzeButton.style.left,
        top: this.analyzeButton.style.top,
        zIndex: this.analyzeButton.style.zIndex
      },
      elementRect: {
        left: rect.left,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }