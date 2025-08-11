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