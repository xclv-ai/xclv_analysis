// XCLV Brand Analysis - Background Service Worker
// AI-powered brand analysis engine

class BrandAnalysisEngine {
  constructor() {
    this.apiEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
    this.defaultModel = 'anthropic/claude-sonnet-4';
    this.cache = new Map();
    this.cacheExpiry = 300000; // 5 minutes
  }

  // Core AI analysis method
  async executeAnalysis(prompt, apiKey, model = this.defaultModel) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': chrome.runtime.getURL(''),
          'X-Title': 'XCLV Brand Analysis Extension'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a strategic brand analysis expert. Analyze content and return structured JSON responses with actionable insights.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Brand analysis API error:', error);
      throw error;
    }
  }

  // Tone of Voice Analysis
  async analyzeToneOfVoice(content, apiKey) {
    const cacheKey = `tone_${this.hashContent(content)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const prompt = `
Analyze the tone of voice in this content and return a JSON response:

CONTENT:
${content}

Return JSON with this exact structure:
{
  "scores": {
    "formality": 85,
    "warmth": 65,
    "authority": 78
  },
  "dominantTone": "professional-authoritative",
  "insights": [
    "Uses sophisticated vocabulary indicating high formality",
    "Moderate warmth through inclusive language",
    "Strong authority through confident assertions"
  ],
  "recommendations": [
    "Consider adding more personal touches to increase warmth",
    "Maintain current authority level for credibility"
  ]
}

Score meanings:
- Formality: 0-100 (0=very casual, 100=very formal)
- Warmth: 0-100 (0=cold/distant, 100=warm/friendly) 
- Authority: 0-100 (0=humble/uncertain, 100=confident/authoritative)
`;

    try {
      const result = await this.executeAnalysis(prompt, apiKey);
      const parsedResult = JSON.parse(result);
      this.setCache(cacheKey, parsedResult);
      return parsedResult;
    } catch (error) {
      return this.getErrorResponse('tone', error);
    }
  }

  // Brand Archetype Analysis
  async analyzeArchetypes(content, apiKey) {
    const cacheKey = `archetype_${this.hashContent(content)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const prompt = `
Analyze the brand archetype mix in this content:

CONTENT:
${content}

Return JSON with this exact structure:
{
  "primaryArchetype": "hero",
  "archetypeScores": {
    "hero": 75,
    "sage": 45,
    "explorer": 30,
    "innocent": 20,
    "ruler": 60,
    "creator": 35,
    "caregiver": 25,
    "magician": 40,
    "lover": 15,
    "jester": 10,
    "outlaw": 20,
    "everyman": 35
  },
  "archetypeMix": "hero-ruler",
  "personality": "Confident leader focused on overcoming challenges and achieving excellence",
  "recommendations": [
    "Emphasize transformation and achievement stories",
    "Use language of victory and triumph",
    "Position as the premium choice for leaders"
  ]
}

Archetype definitions:
- Hero: Courage, determination, proving worth through action
- Sage: Wisdom, truth, helping others understand the world  
- Explorer: Freedom, finding yourself, experiencing the world
- Innocent: Happiness, goodness, optimism, simple pleasures
- Ruler: Control, responsibility, creating prosperity and success
- Creator: Innovation, imagination, artistic self-expression
- Caregiver: Service, helping others, protection and care
- Magician: Power, transformation, making dreams come true
- Lover: Love, intimacy, passion, commitment
- Jester: Fun, humor, living in the moment
- Outlaw: Revolution, revenge, rules are meant to be broken
- Everyman: Belonging, connection, being down to earth
`;

    try {
      const result = await this.executeAnalysis(prompt, apiKey);
      const parsedResult = JSON.parse(result);
      this.setCache(cacheKey, parsedResult);
      return parsedResult;
    } catch (error) {
      return this.getErrorResponse('archetype', error);
    }
  }

  // Message Clarity Analysis (for individual text elements)
  async analyzeMessageClarity(text, context, apiKey) {
    const cacheKey = `clarity_${this.hashContent(text)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const prompt = `
Analyze the clarity and effectiveness of this specific text element:

TEXT: "${text}"
CONTEXT: ${context}

Return JSON with this exact structure:
{
  "clarityScore": 82,
  "readabilityScore": 75,
  "emotionalImpact": 68,
  "effectiveness": "high",
  "quickInsights": [
    {
      "type": "positive",
      "message": "Clear and direct language"
    },
    {
      "type": "improvement", 
      "message": "Could be more specific about benefits"
    }
  ],
  "improvements": [
    "Add specific metrics or examples",
    "Use more action-oriented verbs",
    "Consider emotional triggers"
  ]
}

Scoring:
- Clarity: How easy to understand (0-100)
- Readability: Sentence structure and flow (0-100)  
- Emotional Impact: Engagement and resonance (0-100)
- Effectiveness: overall|high|medium|low
`;

    try {
      const result = await this.executeAnalysis(prompt, apiKey);
      const parsedResult = JSON.parse(result);
      this.setCache(cacheKey, parsedResult);
      return parsedResult;
    } catch (error) {
      return this.getErrorResponse('clarity', error);
    }
  }

  // Page-wide comprehensive analysis
  async analyzePageBrand(contentData, apiKey) {
    const cacheKey = `page_${this.hashContent(JSON.stringify(contentData))}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const prompt = `
Perform comprehensive brand analysis on this webpage content:

HEADLINES: ${JSON.stringify(contentData.headlines)}
MAIN CONTENT: ${contentData.mainContent}
CALL TO ACTIONS: ${JSON.stringify(contentData.callToActions)}
NAVIGATION: ${JSON.stringify(contentData.navigation)}

Return JSON with this exact structure:
{
  "overallScore": 78,
  "brandConsistency": 85,
  "messageClarity": 72,
  "emotionalResonance": 68,
  "toneAnalysis": {
    "formality": 80,
    "warmth": 60,
    "authority": 85
  },
  "primaryArchetype": "ruler",
  "archetypeStrength": 75,
  "strengths": [
    "Consistent professional tone throughout",
    "Clear value proposition",
    "Strong authoritative voice"
  ],
  "weaknesses": [
    "Limited emotional connection",
    "Some jargon may confuse users",
    "CTAs could be more compelling"
  ],
  "recommendations": [
    "Add more emotional language to connect with audience",
    "Simplify technical terms for broader appeal",
    "Strengthen call-to-action language with urgency"
  ],
  "competitivePosition": "premium-professional"
}
`;

    try {
      const result = await this.executeAnalysis(prompt, apiKey);
      const parsedResult = JSON.parse(result);
      this.setCache(cacheKey, parsedResult);
      return parsedResult;
    } catch (error) {
      return this.getErrorResponse('page', error);
    }
  }

  // Utility methods
  hashContent(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getErrorResponse(type, error) {
    return {
      error: true,
      type,
      message: error.message || 'Analysis failed',
      fallback: {
        scores: type === 'tone' ? { formality: 50, warmth: 50, authority: 50 } : {},
        recommendations: ['Unable to analyze content. Please try again.']
      }
    };
  }
}

// Storage Manager
class StorageManager {
  async getApiKey() {
    const result = await chrome.storage.sync.get(['openrouterApiKey']);
    return result.openrouterApiKey || null;
  }

  async setApiKey(apiKey) {
    await chrome.storage.sync.set({ openrouterApiKey: apiKey });
  }

  async getSettings() {
    const result = await chrome.storage.sync.get([
      'selectedModel',
      'analysisMode',
      'autoAnalyze',
      'confidenceThreshold'
    ]);
    
    return {
      selectedModel: result.selectedModel || 'anthropic/claude-sonnet-4',
      analysisMode: result.analysisMode || 'comprehensive',
      autoAnalyze: result.autoAnalyze !== false,
      confidenceThreshold: result.confidenceThreshold || 70
    };
  }

  async saveSettings(settings) {
    await chrome.storage.sync.set(settings);
  }
}

// Initialize services
const brandAnalysisEngine = new BrandAnalysisEngine();
const storageManager = new StorageManager();

// Message handler for communication with content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handleAsyncMessage = async () => {
    try {
      const apiKey = await storageManager.getApiKey();
      
      if (!apiKey) {
        sendResponse({
          error: true,
          message: 'API key not configured. Please set up your OpenRouter API key in the extension popup.'
        });
        return;
      }

      switch (request.action) {
        case 'analyzeTone':
          const toneResult = await brandAnalysisEngine.analyzeToneOfVoice(request.content, apiKey);
          sendResponse({ success: true, result: toneResult });
          break;

        case 'analyzeArchetypes':
          const archetypeResult = await brandAnalysisEngine.analyzeArchetypes(request.content, apiKey);
          sendResponse({ success: true, result: archetypeResult });
          break;

        case 'analyzeClarity':
          const clarityResult = await brandAnalysisEngine.analyzeMessageClarity(
            request.text, 
            request.context, 
            apiKey
          );
          sendResponse({ success: true, result: clarityResult });
          break;

        case 'analyzePage':
          const pageResult = await brandAnalysisEngine.analyzePageBrand(request.contentData, apiKey);
          sendResponse({ success: true, result: pageResult });
          break;

        case 'getSettings':
          const settings = await storageManager.getSettings();
          sendResponse({ success: true, settings });
          break;

        case 'saveSettings':
          await storageManager.saveSettings(request.settings);
          sendResponse({ success: true });
          break;

        case 'setApiKey':
          await storageManager.setApiKey(request.apiKey);
          sendResponse({ success: true });
          break;

        case 'getApiKey':
          const currentApiKey = await storageManager.getApiKey();
          sendResponse({ success: true, apiKey: currentApiKey });
          break;

        case 'verifyApiKey':
          try {
            await brandAnalysisEngine.executeAnalysis(
              'Test connection', 
              request.apiKey
            );
            sendResponse({ success: true, valid: true });
          } catch (error) {
            sendResponse({ success: true, valid: false, error: error.message });
          }
          break;

        default:
          sendResponse({ error: true, message: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ 
        error: true, 
        message: error.message || 'An unexpected error occurred' 
      });
    }
  };

  handleAsyncMessage();
  return true; // Keep message channel open for async response
});

// Extension lifecycle
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default settings on first install
    await storageManager.saveSettings({
      selectedModel: 'anthropic/claude-sonnet-4',
      analysisMode: 'comprehensive',
      autoAnalyze: true,
      confidenceThreshold: 70
    });
    
    console.log('XCLV Brand Analysis extension installed successfully');
  }
});

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
  console.log('XCLV Brand Analysis service worker started');
});
