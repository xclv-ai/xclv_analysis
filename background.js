// XCLV Brand Analysis - Enhanced Background Service with Robust API Handling
// Fixed "Invalid candidate structure" error and improved response parsing

class PromptManager {
  constructor() {
    this.prompts = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Load all prompts from the prompts folder
      await Promise.all([
        this.loadPrompt('comprehensive-brand-analysis'),
        this.loadPrompt('tone-of-voice-analysis'), 
        this.loadPrompt('brand-archetype-analysis'),
        this.loadPrompt('text-element-analysis')
      ]);
      
      this.isInitialized = true;
      console.log('XCLV: Prompt Manager initialized with', this.prompts.size, 'prompts');
    } catch (error) {
      console.error('XCLV: Failed to initialize prompts:', error);
      this.fallbackToBuiltInPrompts();
    }
  }

  async loadPrompt(promptName) {
    try {
      const response = await fetch(chrome.runtime.getURL(`prompts/${promptName}.md`));
      if (response.ok) {
        const content = await response.text();
        this.prompts.set(promptName, content);
        console.log(`XCLV: Loaded prompt: ${promptName}`);
      } else {
        throw new Error(`Failed to load prompt: ${promptName}`);
      }
    } catch (error) {
      console.error(`XCLV: Error loading prompt ${promptName}:`, error);
      // Fallback to built-in prompt if file loading fails
      this.prompts.set(promptName, this.getBuiltInPrompt(promptName));
    }
  }

  getPrompt(promptName, variables = {}) {
    if (!this.isInitialized) {
      console.warn('XCLV: Prompt Manager not initialized, using built-in prompts');
      return this.getBuiltInPrompt(promptName, variables);
    }

    let prompt = this.prompts.get(promptName);
    if (!prompt) {
      console.warn(`XCLV: Prompt ${promptName} not found, using built-in fallback`);
      return this.getBuiltInPrompt(promptName, variables);
    }

    // Replace template variables
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      prompt = prompt.replace(regex, variables[key]);
    });

    return prompt;
  }

  getBuiltInPrompt(promptName, variables = {}) {
    const prompts = {
      'comprehensive-brand-analysis': `You are XCLV, a strategic brand analysis expert specializing in the LiveBranding methodology.

Analyze the following web content for comprehensive brand intelligence:

WEBSITE: ${variables.url || 'Unknown'}
CONTENT: ${variables.text || 'No content provided'}

Provide a comprehensive JSON analysis with these sections:

{
  "brand_name": "[Extracted or inferred brand name]",
  "tone_analysis": {
    "formality": {
      "score": [0-100],
      "position": "[Very Formal|Formal|Balanced|Casual|Very Casual]",
      "evidence": "[Specific language examples]"
    },
    "warmth": {
      "score": [0-100], 
      "position": "[Cold|Cool|Neutral|Warm|Very Warm]",
      "evidence": "[Specific language examples]"
    },
    "authority": {
      "score": [0-100],
      "position": "[Humble|Modest|Balanced|Confident|Authoritative]", 
      "evidence": "[Specific language examples]"
    },
    "authenticity": {
      "score": [0-100],
      "position": "[Corporate|Professional|Balanced|Genuine|Very Authentic]",
      "evidence": "[Specific language examples]"
    },
    "innovation": {
      "score": [0-100],
      "position": "[Traditional|Conservative|Balanced|Progressive|Cutting-edge]",
      "evidence": "[Specific language examples]"
    },
    "dominant_tone": "[Overall tone description]",
    "brand_personality": "[One-sentence brand character description]"
  },
  "archetype_analysis": {
    "primary_archetype": {
      "name": "[Primary archetype name]",
      "confidence": [0-100],
      "evidence": ["[Supporting quote 1]", "[Supporting quote 2]"],
      "justification": "[Why this archetype fits]"
    },
    "secondary_archetype": {
      "name": "[Secondary archetype name]", 
      "confidence": [0-100],
      "evidence": ["[Supporting quote 1]"],
      "justification": "[How it complements primary]"
    }
  },
  "recommendations": {
    "quick_wins": [
      {
        "area": "[Specific improvement area]",
        "action": "[Specific actionable change]",
        "impact": "[Expected business impact]"
      }
    ]
  }
}

Return ONLY valid JSON. No markdown, no explanations, just the analysis object.`,

      'text-element-analysis': `You are XCLV, a strategic brand analysis expert. Analyze this specific text element for brand messaging effectiveness.

TEXT TO ANALYZE: "${variables.text || 'No text provided'}"

ELEMENT CONTEXT:
- Tag: ${variables.element?.tagName || 'unknown'}
- Class: ${variables.element?.className || 'none'}
- ID: ${variables.element?.id || 'none'}
- Text Length: ${variables.element?.textLength || 0} characters
- Page: ${variables.page?.title || 'Unknown'} (${variables.page?.url || 'unknown'})

CONTEXT DATA:
${JSON.stringify(variables.context || {}, null, 2)}

Provide a focused JSON analysis:

{
  "clarityScore": [0-100],
  "comprehensionLevel": "immediate"|"quick"|"slow",
  "emotionalResonance": [0-100],
  "actionPotential": "high"|"medium"|"low",
  "brandAlignment": {
    "tone": "description of tone detected",
    "archetype": "likely brand archetype",
    "consistency": [0-100]
  },
  "quickInsights": [
    {
      "type": "positive"|"improvement"|"warning",
      "message": "specific insight"
    }
  ],
  "recommendations": [
    {
      "area": "clarity"|"tone"|"positioning",
      "suggestion": "specific improvement", 
      "impact": "expected result"
    }
  ],
  "textQuality": {
    "readability": [0-100],
    "engagement": [0-100],
    "memorability": [0-100]
  }
}

Return ONLY valid JSON.`
    };

    return prompts[promptName] || 'Default analysis prompt not available.';
  }

  fallbackToBuiltInPrompts() {
    console.log('XCLV: Using built-in prompts as fallback');
    this.isInitialized = true;
  }
}

class BrandAnalysisService {
  constructor() {
    this.apiKey = null;
    this.selectedModel = 'gemini-1.5-flash';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/';
    this.isInitialized = false;
    this.promptManager = new PromptManager();
  }

  async initialize() {
    try {
      const result = await chrome.storage.local.get(['geminiApiKey', 'selectedModel']);
      this.apiKey = result.geminiApiKey;
      this.selectedModel = result.selectedModel || 'gemini-1.5-flash';
      
      // Initialize prompt manager
      await this.promptManager.initialize();
      
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

    const systemPrompt = this.promptManager.getPrompt('comprehensive-brand-analysis', {
      url: data.url,
      text: data.text
    });
    
    try {
      const response = await this.callGeminiAPI(systemPrompt, data);
      return {
        success: true,
        data: response,
        systemPrompt: systemPrompt,
        metadata: {
          model: this.selectedModel,
          timestamp: new Date().toISOString(),
          url: data.url,
          promptType: 'comprehensive-brand-analysis'
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

    const systemPrompt = this.promptManager.getPrompt('text-element-analysis', {
      text: data.text,
      element: data.element,
      page: data.page,
      context: data.context
    });
    
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
          url: data.page?.url,
          promptType: 'text-element-analysis'
        }
      };
    } catch (error) {
      console.error('Text element analysis failed:', error);
      return {
        success: false,
        error: `Text analysis failed: ${error.message}`,
        systemPrompt: systemPrompt,
        parsedContent: data,
        metadata: {
          model: this.selectedModel,
          timestamp: new Date().toISOString(),
          element: data.element,
          url: data.page?.url,
          promptType: 'text-element-analysis'
        }
      };
    }
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
    
    // Enhanced error checking with better debugging
    console.log('XCLV: Raw API response:', JSON.stringify(result, null, 2));
    
    if (!result) {
      throw new Error('Empty API response received');
    }

    // Check for error in response
    if (result.error) {
      throw new Error(`API error: ${result.error.message || 'Unknown API error'}`);
    }

    // Check for candidates array
    if (!result.candidates || !Array.isArray(result.candidates)) {
      console.error('XCLV: No candidates array in response:', result);
      throw new Error('No candidates array in API response');
    }

    if (result.candidates.length === 0) {
      throw new Error('Empty candidates array in API response');
    }

    const candidate = result.candidates[0];
    
    // Check if candidate was blocked
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      throw new Error(`Content generation stopped: ${candidate.finishReason}`);
    }

    // More flexible content extraction
    let textContent = null;

    // Try different response structures
    if (candidate.content && candidate.content.parts && Array.isArray(candidate.content.parts)) {
      // Standard structure
      const part = candidate.content.parts[0];
      if (part && part.text) {
        textContent = part.text;
      }
    } else if (candidate.text) {
      // Alternative structure
      textContent = candidate.text;
    } else if (candidate.output) {
      // Another alternative structure
      textContent = candidate.output;
    }

    if (!textContent) {
      console.error('XCLV: No text content found in candidate:', candidate);
      throw new Error('No text content in API response candidate');
    }

    try {
      // Clean the response text more aggressively
      let cleanText = textContent
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .replace(/^\s*```[\s\S]*?```\s*/g, '')
        .trim();
      
      // Find JSON object boundaries
      const jsonStart = cleanText.indexOf('{');
      const jsonEnd = cleanText.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
      }

      const parsedResponse = JSON.parse(cleanText);
      console.log('XCLV: Successfully parsed response:', parsedResponse);
      return parsedResponse;
    } catch (parseError) {
      console.error('XCLV: Failed to parse JSON response:', textContent);
      console.error('XCLV: Parse error:', parseError.message);
      throw new Error(`Failed to parse API response as JSON: ${parseError.message}`);
    }
  }

  async testConnection() {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    try {
      const testPrompt = 'Respond with exactly this JSON object: {"status": "connected", "model": "' + this.selectedModel + '"}';
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

  // Method to get available prompts
  getAvailablePrompts() {
    return Array.from(this.promptManager.prompts.keys());
  }

  // Method to reload prompts (useful for development)
  async reloadPrompts() {
    await this.promptManager.initialize();
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
            error: error.message,
            systemPrompt: 'Error occurred before prompt generation',
            parsedContent: request.data,
            metadata: {
              model: brandAnalysisService.selectedModel,
              timestamp: new Date().toISOString(),
              element: request.data.element,
              url: request.data.page?.url || 'unknown'
            }
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

    case 'getAvailablePrompts':
      sendResponse({ 
        success: true, 
        prompts: brandAnalysisService.getAvailablePrompts() 
      });
      break;

    case 'reloadPrompts':
      brandAnalysisService.reloadPrompts()
        .then(() => {
          sendResponse({ success: true, message: 'Prompts reloaded successfully' });
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true;
      
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
