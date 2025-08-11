  // NEW: Enhanced click handling for click-to-analyze mode
  handleClick(event) {
    console.log('XCLV: Click event detected:', {
      target: event.target.tagName,
      className: event.target.className,
      isAnalyzableElement: this.isAnalyzableElement(event.target),
      isXCLVElement: this.isXCLVElement(event.target),
      isHoverMode: this.isHoverMode,
      isAnalyzing: this.isAnalyzing
    });

    // Handle analyze button clicks
    if (event.target.classList?.contains('xclv-analyze-btn-inline')) {
      console.log('XCLV: Analyze button clicked!');
      event.preventDefault();
      event.stopPropagation();
      this.analyzeElement(this.selectedElement);
      return;
    }

    // Handle element selection
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
      console.log('XCLV: Analyzable element clicked!');
      
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
      console.log('XCLV: Selecting new element');
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

  // NEW: Select element and show analyze button
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

  // UPDATED: Show analyze button that stays attached to selected element
  showAnalyzeButton(element) {
    console.log('XCLV: showAnalyzeButton called for:', element.tagName);
    
    this.hideAnalyzeButton(); // Remove any existing button

    const rect = element.getBoundingClientRect();
    console.log('XCLV: Element rect:', rect);
    
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
    
    // Force display and visibility - CRITICAL FOR DEBUGGING
    this.analyzeButton.style.display = 'block !important';
    this.analyzeButton.style.visibility = 'visible !important';
    this.analyzeButton.style.opacity = '1 !important';
    this.analyzeButton.style.pointerEvents = 'auto !important';
    
    document.body.appendChild(this.analyzeButton);
    
    console.log('XCLV: Analyze button created and attached:', {
      element: element.tagName,
      buttonElement: this.analyzeButton,
      buttonInDOM: document.body.contains(this.analyzeButton),
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
      },
      computedStyle: window.getComputedStyle(this.analyzeButton)
    });
    
    // Test button visibility after 100ms
    setTimeout(() => {
      const buttonRect = this.analyzeButton?.getBoundingClientRect();
      console.log('XCLV: Button visibility check:', {
        exists: !!this.analyzeButton,
        inDOM: this.analyzeButton ? document.body.contains(this.analyzeButton) : false,
        rect: buttonRect,
        visible: buttonRect ? (buttonRect.width > 0 && buttonRect.height > 0) : false,
        style: this.analyzeButton ? {
          display: this.analyzeButton.style.display,
          visibility: this.analyzeButton.style.visibility,
          opacity: this.analyzeButton.style.opacity,
          position: this.analyzeButton.style.position,
          zIndex: this.analyzeButton.style.zIndex
        } : null
      });
    }, 100);
  }