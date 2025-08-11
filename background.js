// XCLV Brand Analysis - Enhanced Background Service Worker
// Supports interactive text element analysis with detailed debugging

class BrandAnalysisService {
  constructor() {
    this.apiKey = null;
    this.selectedModel = 'gemini-2.5-flash';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/';
    this.isInitialized = false;
  }

  async initialize() {
    try {
      const result = await chrome.storage.local.get(['geminiApiKey', 'selectedModel']);
      this.apiKey = result.geminiApiKey;
      this.selectedModel = result.selectedModel || 'gemini-2.5-flash';
      this.isInitialized = true;
      console.log('XCLV: Brand Analysis Service initialized');
    } catch (error) {
      console.error('Failed to initialize Brand Analysis Service:', error);
    }
  }

  async analyzeContent(data) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const systemPrompt = this.buildAnalysisPrompt(data);
    
    try {
      const response = await this.callGeminiAPI(systemPrompt, data);
      return {
        success: true,
        data: response,
        systemPrompt: systemPrompt,
        metadata: {
          model: this.selectedModel,
          timestamp: new Date().toISOString(),
          url: data.url
        }
      };
    } catch (error) {
      console.error('Analysis failed:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  async analyzeTextElement(data) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const systemPrompt = this.buildTextElementPrompt(data);
    
    try {
      const response = await this.callGeminiAPI(systemPrompt, data);
      return {
        success: true,
        data: response,
        systemPrompt: systemPrompt,
        parsedContent: data,
        metadata: {
          model: this.selectedModel,
          timestamp: new Date().toISOString(),
          element: data.element,
          url: data.page.url
        }
      };
    } catch (error) {
      console.error('Text element analysis failed:', error);
      throw new Error(`Text analysis failed: ${error.message}`);
    }
  }

  buildAnalysisPrompt(data) {
    return `You are XCLV, a strategic brand analysis expert specializing in the LiveBranding methodology.

Analyze the following web content for brand intelligence:

WEBSITE: ${data.url}
CONTENT: ${data.text}

Provide a comprehensive JSON analysis with these sections:

1. TONE OF VOICE ANALYSIS:
- formality: score 0-100 (0=very casual, 100=very formal)
- warmth: score 0-100 (0=cold/distant, 100=warm/personal)
- authority: score 0-100 (0=humble/uncertain, 100=confident/authoritative)
- authenticity: score 0-100 (0=corporate/artificial, 100=genuine/human)
- innovation: score 0-100 (0=traditional/conservative, 100=cutting-edge/disruptive)
- dominantTone: brief description of overall voice
- brandPersonality: one-sentence brand character description
- recommendations: array of specific improvements with area and insight
- culturalAlignment: how well the brand fits current cultural trends

2. BRAND ARCHETYPE ANALYSIS:
- primaryArchetype: {name, score, evidence array}
- secondaryArchetype: {name, score, evidence array}
- recommendations: array with archetype and rationale
- brandEvolution: suggested direction for brand development
- archetypeMix: description of archetype combination

Return ONLY valid JSON. No markdown, no explanations, just the analysis object.`;
  }

  buildTextElementPrompt(data) {
    const contextInfo = data.context ? JSON.stringify(data.context, null, 2) : 'No context available';
    
    return `You are XCLV, a strategic brand analysis expert. Analyze this specific text element for brand messaging effectiveness.

TEXT TO ANALYZE: "${data.text}"

ELEMENT CONTEXT:
- Tag: ${data.element.tagName}
- Class: ${data.element.className || 'none'}
- ID: ${data.element.id || 'none'}
- Text Length: ${data.element.textLength} characters
- Page: ${data.page.title} (${data.page.url})

CONTEXT DATA:
${contextInfo}

Provide a focused JSON analysis:

{
  "clarityScore": 0-100,
  "comprehensionLevel": "immediate" | "quick" | "slow",
  "emotionalResonance": 0-100,
  "actionPotential": "high" | "medium" | "low",
  "brandAlignment": {
    "tone": "description of tone detected",
    "archetype": "likely brand archetype",
    "consistency": 0-100
  },
  "quickInsights": [
    {
      "type": "positive" | "improvement" | "warning",
      "message": "specific insight"
    }
  ],
  "recommendations": [
    {
      "area": "clarity" | "tone" | "positioning",
      "suggestion": "specific improvement",
      "impact": "expected result"
    }
  ],
  "textQuality": {
    "readability": 0-100,
    "engagement": 0-100,
    "memorability": 0-100
  }
}

Return ONLY valid JSON.`;
  }

  async callGeminiAPI(prompt, data) {
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 32,
        topP: 0.8,
        maxOutputTokens: 2048,
        stopSequences: []
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const url = `${this.baseUrl}${this.selectedModel}:generateContent?key=${this.apiKey}`;
    
    console.log('XCLV: Calling Gemini API with model:', this.selectedModel);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${response.status} ${error}`);
    }

    const result = await response.json();
    
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      throw new Error('Invalid API response format');
    }

    const text = result.candidates[0].content.parts[0].text;
    
    try {
      // Clean the response text
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', text);
      throw new Error(`Failed to parse API response: ${parseError.message}`);
    }
  }

  async testConnection() {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    try {
      const testPrompt = 'Respond with a simple JSON object: {"status": "connected", "model": "' + this.selectedModel + '"}';
      const result = await this.callGeminiAPI(testPrompt, { text: 'test' });
      
      if (result && result.status === 'connected') {
        return { success: true, model: result.model };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }
}

// Initialize service
const brandAnalysisService = new BrandAnalysisService();

// Message listener for extension communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('XCLV Background: Received message:', request.action);
  
  switch (request.action) {
    case 'analyzeContent':
      brandAnalysisService.analyzeContent(request.data)
        .then(sendResponse)
        .catch(error => {
          console.error('Content analysis failed:', error);
          sendResponse({ 
            success: false, 
            error: error.message 
          });
        });
      return true; // Keep message channel open for async response
      
    case 'analyzeTextElement':
      brandAnalysisService.analyzeTextElement(request.data)
        .then(sendResponse)
        .catch(error => {
          console.error('Text element analysis failed:', error);
          sendResponse({ 
            success: false, 
            error: error.message 
          });
        });
      return true;
      
    case 'testApiConnection':
      brandAnalysisService.testConnection()
        .then(result => {
          sendResponse({ success: true, ...result });
        })
        .catch(error => {
          console.error('API test failed:', error);
          sendResponse({ 
            success: false, 
            error: error.message 
          });
        });
      return true;
      
    case 'updateApiSettings':
      brandAnalysisService.apiKey = request.data.apiKey;
      brandAnalysisService.selectedModel = request.data.selectedModel;
      sendResponse({ success: true });
      break;
      
    default:
      console.warn('Unknown action:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  brandAnalysisService.initialize();
});

// Initialize on installation
chrome.runtime.onInstalled.addListener((details) => {
  brandAnalysisService.initialize();
  
  if (details.reason === 'install') {
    console.log('XCLV Brand Analysis Extension installed');
  } else if (details.reason === 'update') {
    console.log('XCLV Brand Analysis Extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Keyboard command handling
chrome.commands.onCommand.addListener((command) => {
  console.log('XCLV: Command received:', command);
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      switch (command) {
        case 'toggle-analysis':
          chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleAnalysis' });
          break;
        case 'show-panel':
          chrome.tabs.sendMessage(tabs[0].id, { action: 'showPanel' });
          break;
        case 'toggle-interactive':
          chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleInteractiveMode' });
          break;
        case 'open-debug':
          chrome.tabs.sendMessage(tabs[0].id, { action: 'openDebugConsole' });
          break;
        case 'export-report':
          chrome.tabs.sendMessage(tabs[0].id, { action: 'exportReport' });
          break;
      }
    }
  });
});

console.log('XCLV Brand Analysis Background Service Worker loaded');