// XCLV Debug Helper - Add to content.js temporarily for debugging
// Insert this at the top of your XCLVContentController class

class DebugLogger {
  static log(stage, data) {
    console.group(`🔍 XCLV Debug - ${stage}`);
    console.log('Data:', data);
    console.log('Type:', typeof data);
    console.log('Length:', data?.length || 'N/A');
    if (typeof data === 'string') {
      console.log('First 200 chars:', data.substring(0, 200) + '...');
    }
    console.groupEnd();
  }

  static logExtractedContent(content) {
    console.group('📄 EXTRACTED CONTENT');
    console.log('Main Content Length:', content.mainContent?.length || 0);
    console.log('Headlines Count:', content.headlines?.length || 0);
    console.log('CTAs Count:', content.callToActions?.length || 0);
    console.log('Navigation Count:', content.navigation?.length || 0);
    
    if (content.mainContent) {
      console.log('Main Content Preview:', content.mainContent.substring(0, 300) + '...');
    }
    
    if (content.headlines?.length) {
      console.log('Headlines:', content.headlines.map(h => h.text).slice(0, 5));
    }
    
    console.groupEnd();
  }

  static logAPIRequest(request) {
    console.group('🚀 API REQUEST');
    console.log('Action:', request.action);
    console.log('URL:', request.data?.url);
    console.log('Text Length:', request.data?.text?.length || 0);
    console.log('Text Preview:', request.data?.text?.substring(0, 200) + '...');
    console.log('Metadata:', request.data?.metadata);
    console.groupEnd();
  }

  static logAPIResponse(response) {
    console.group('📥 API RESPONSE');
    console.log('Success:', response?.success);
    console.log('Error:', response?.error);
    console.log('Data:', response?.data);
    console.groupEnd();
  }
}

// Add this to your startAnalysis method in XCLVContentController:
async startAnalysis() {
  try {
    this.isAnalyzing = true;
    
    // Extract page content
    const content = this.extractor.extractPageContent();
    
    // 🔍 DEBUG: Log extracted content
    DebugLogger.logExtractedContent(content);
    
    const mainText = content.mainContent;
    
    if (!mainText || mainText.length < 50) {
      DebugLogger.log('CONTENT_ERROR', `Insufficient content: ${mainText?.length || 0} chars`);
      throw new Error('Insufficient content for analysis');
    }
    
    // 🔍 DEBUG: Log what we're sending to background
    const requestData = {
      action: 'analyzeContent',
      data: {
        text: mainText,
        url: window.location.href,
        metadata: content.metadata
      }
    };
    DebugLogger.logAPIRequest(requestData);
    
    // Send to background script for AI analysis
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage(requestData, resolve);
    });
    
    // 🔍 DEBUG: Log response from background
    DebugLogger.logAPIResponse(response);
    
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
