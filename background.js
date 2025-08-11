// XCLV Brand Analysis - Enhanced Background Script
// Strategic Brand Intelligence Engine with Gemini 2.5 API + Interactive Text Analysis

class AIServiceBase {
  constructor(serviceName, systemPrompt) {
    this.serviceName = serviceName;
    this.systemPrompt = systemPrompt;
    this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  async executeAIOperation(data, promptBuilder, responseParser) {
    try {
      const prompt = promptBuilder(data);
      const response = await this.callGeminiAPI(prompt);
      return responseParser(response);
    } catch (error) {
      console.error(`${this.serviceName} operation failed:`, error);
      throw new Error(`Brand analysis temporarily unavailable: ${error.message}`);
    }
  }

  async callGeminiAPI(userPrompt, retryCount = 0) {
    try {
      const { geminiApiKey, selectedModel } = await this.getAPISettings();
      
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured. Please set it in the extension popup.');
      }

      const model = selectedModel || 'gemini-2.5-flash';
      const fullPrompt = `${this.systemPrompt}\n\nUser Request: ${userPrompt}`;

      const response = await fetch(`${this.apiEndpoint}/${model}:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
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
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini 2.5 API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Gemini 2.5 API');
      }

      const responseContent = data.candidates[0].content.parts[0].text;
      
      return {
        content: responseContent,
        systemPrompt: this.systemPrompt,
        fullPrompt: fullPrompt,
        rawResponse: data
      };
    } catch (error) {
      if (retryCount < this.maxRetries && !error.message.includes('API key')) {
        await this.delay(this.retryDelay * (retryCount + 1));
        return this.callGeminiAPI(userPrompt, retryCount + 1);
      }
      throw error;
    }
  }

  async getAPISettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['geminiApiKey', 'selectedModel'], (result) => {
        resolve({
          geminiApiKey: result.geminiApiKey || '',
          selectedModel: result.selectedModel || 'gemini-2.5-flash'
        });
      });
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class TextElementAnalysisService extends AIServiceBase {
  constructor() {
    super('Text Element Analysis', `You are an expert brand strategist and content analyst specializing in micro-level text analysis. Your role is to evaluate individual text elements (headlines, paragraphs, CTAs) for maximum brand impact.

    ANALYSIS FOCUS:
    - Message clarity and immediate comprehension
    - Emotional impact and engagement potential
    - Brand voice consistency and archetype alignment
    - Action-driving power and conversion potential
    - Cultural relevance and modern market fit
    
    EXPERTISE AREAS:
    - LiveBranding methodology (brands as evolving systems)
    - Conversion-focused copywriting
    - Brand archetype psychology
    - User experience and cognitive load
    - Modern consumer behavior patterns

    Always provide actionable, specific feedback that brand strategists can implement immediately.
    Be bold and direct in your assessments - brands need honest feedback to evolve effectively.`);
  }

  async analyzeTextElement(elementData) {
    return this.executeAIOperation(
      elementData,
      (data) => this.buildTextAnalysisPrompt(data),
      (response) => this.parseTextAnalysis(response)
    );
  }

  buildTextAnalysisPrompt(data) {
    const { text, context, element, page } = data;
    
    return `Analyze this specific text element for brand effectiveness and user impact:

TEXT TO ANALYZE:
"${text}"

ELEMENT CONTEXT:
- Element Type: ${element.tagName}
- Text Length: ${element.textLength} characters
- Page Context: ${page.title} (${page.domain})
- Parent Element: ${context.parentElement}
- Position: ${context.position}/${context.siblingCount}
- Section: ${context.styling ? 'With custom styling' : 'Default styling'}

ANALYSIS REQUIREMENTS:
Evaluate this text across 8 critical dimensions:

1. IMMEDIATE CLARITY (0-100)
   - Can users understand this in 3 seconds or less?
   - Are there any cognitive barriers or confusing elements?

2. EMOTIONAL ENGAGEMENT (0-100)
   - Does this create an emotional response?
   - What specific emotions does it trigger?

3. ACTION POTENTIAL (0-100)
   - Does this drive specific user behavior?
   - How clear is the intended action?

4. BRAND VOICE ALIGNMENT (0-100)
   - Does this match expected brand personality?
   - Is the tone consistent with brand archetype?

5. CONVERSION EFFECTIVENESS (0-100)
   - How likely is this to drive desired outcomes?
   - Does it overcome user objections?

6. CULTURAL RELEVANCE (0-100)
   - Does this connect with current audience expectations?
   - Is the language modern and appropriate?

7. COGNITIVE LOAD (0-100)
   - How easy is this to process mentally?
   - Does it minimize user effort?

8. MEMORABILITY (0-100)
   - Will users remember this message?
   - Does it have distinctive qualities?

Return JSON with this EXACT structure:
{
  "overallScore": 0-100,
  "scores": {
    "clarity": 0-100,
    "engagement": 0-100,
    "actionPotential": 0-100,
    "brandAlignment": 0-100,
    "conversion": 0-100,
    "culturalRelevance": 0-100,
    "cognitiveLoad": 0-100,
    "memorability": 0-100
  },
  "primaryInsight": "one-sentence key finding",
  "strengthCategories": ["list", "of", "strength", "areas"],
  "improvementAreas": ["list", "of", "improvement", "areas"],
  "quickWins": [
    {
      "change": "specific text modification",
      "reason": "why this improves effectiveness",
      "impact": "expected business impact"
    }
  ],
  "brandArchetypeAlignment": {
    "detectedArchetype": "primary archetype this text represents",
    "confidence": 0-100,
    "evidence": ["specific", "examples", "from", "text"]
  },
  "emotionalProfile": {
    "primaryEmotion": "main emotional trigger",
    "intensity": "low|medium|high",
    "appropriateness": "how well emotion fits context"
  },
  "competitiveAdvantage": "how this positions against competitors",
  "nextLevelStrategy": "advanced optimization recommendation"
}

CRITICAL: Respond ONLY with valid JSON. No markdown, no explanations, just the JSON object.`;
  }

  parseTextAnalysis(response) {
    try {
      let cleanedResponse = response.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const jsonStart = cleanedResponse.indexOf('{');
      if (jsonStart > 0) {
        cleanedResponse = cleanedResponse.substring(jsonStart);
      }
      
      const jsonEnd = cleanedResponse.lastIndexOf('}');
      if (jsonEnd < cleanedResponse.length - 1) {
        cleanedResponse = cleanedResponse.substring(0, jsonEnd + 1);
      }
      
      const parsed = JSON.parse(cleanedResponse);
      
      if (!parsed.overallScore || !parsed.scores || !parsed.primaryInsight) {
        throw new Error('Invalid response structure');
      }
      
      parsed._debug = {
        systemPrompt: response.systemPrompt,
        rawResponse: response.rawResponse,
        timestamp: Date.now()
      };
      
      return parsed;
    } catch (error) {
      console.error('Failed to parse text analysis:', error);
      console.error('Raw response:', response.content);
      return this.getDefaultTextAnalysis(error.message);
    }
  }

  getDefaultTextAnalysis(errorMessage) {
    return {
      overallScore: 0,
      scores: {
        clarity: 0,
        engagement: 0,
        actionPotential: 0,
        brandAlignment: 0,
        conversion: 0,
        culturalRelevance: 0,
        cognitiveLoad: 0,
        memorability: 0
      },
      primaryInsight: "Analysis temporarily unavailable",
      strengthCategories: [],
      improvementAreas: ["Analysis system unavailable"],
      quickWins: [],
      brandArchetypeAlignment: {
        detectedArchetype: "Unknown",
        confidence: 0,
        evidence: []
      },
      emotionalProfile: {
        primaryEmotion: "neutral",
        intensity: "low",
        appropriateness: "unknown"
      },
      competitiveAdvantage: "Unable to assess",
      nextLevelStrategy: "Retry analysis when system is available",
      _error: errorMessage
    };
  }
}

class BrandAnalysisService extends AIServiceBase {
  constructor() {
    super('Brand Analysis', `You are a strategic brand analysis expert with 20+ years of experience, powered by Gemini 2.5 AI.

    Analyze web content for:
    - Tone of voice (professional, casual, authoritative, friendly, etc.)
    - Brand archetype alignment (Hero, Sage, Explorer, Innocent, Ruler, etc.)
    - Message clarity and coherence
    - Emotional resonance and engagement
    - Brand consistency across touchpoints
    - Competitive positioning insights
    - Cultural relevance and modern market fit

    Always return structured JSON responses with actionable insights.
    Be bold in your assessments - brands need honest feedback to evolve.
    Consider current market trends and cultural context in your analysis.`);
  }

  async analyzeToneOfVoice(content) {
    return this.executeAIOperation(
      { content },
      (data) => this.buildToneAnalysisPrompt(data.content),
      (response) => this.parseToneAnalysis(response.content)
    );
  }

  buildToneAnalysisPrompt(content) {
    return `Analyze the tone of voice in this content using Gemini 2.5's advanced understanding. Focus on the LiveBranding approach - how this tone positions the brand in the current cultural moment.

Content to analyze:
"""
${content}
"""

Return JSON with this exact structure:
{
  "scores": {
    "formality": 0-100,
    "warmth": 0-100, 
    "authority": 0-100,
    "authenticity": 0-100,
    "innovation": 0-100
  },
  "dominantTone": "string description",
  "culturalAlignment": "how tone fits current cultural trends",
  "recommendations": [
    {
      "area": "specific aspect to improve",
      "insight": "what to change and why",
      "impact": "business impact of this change"
    }
  ],
  "brandPersonality": "one-sentence brand personality assessment"
}`;
  }

  parseToneAnalysis(responseText) {
    try {
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);
      
      if (!parsed.scores || !parsed.dominantTone) {
        throw new Error('Invalid response structure');
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to parse tone analysis:', error);
      return this.getDefaultToneAnalysis();
    }
  }

  async analyzeArchetypes(content) {
    return this.executeAIOperation(
      { content },
      (data) => this.buildArchetypePrompt(data.content),
      (response) => this.parseArchetypeAnalysis(response.content)
    );
  }

  buildArchetypePrompt(content) {
    return `Analyze brand archetype alignment in this content using Gemini 2.5's sophisticated pattern recognition. Consider how archetypal messaging creates deeper brand connection in today's market.

Content:
"""
${content}
"""

Analyze against these 12 brand archetypes:
- Hero: Courage, determination, proving worth through action
- Sage: Wisdom, knowledge, understanding truth
- Explorer: Freedom, adventure, authentic experiences  
- Innocent: Optimism, simplicity, faith and happiness
- Ruler: Responsibility, leadership, luxury and sophistication
- Creator: Imagination, artistic value, self-expression
- Caregiver: Caring, nurturing, helping others
- Magician: Transformation, vision, making dreams reality
- Lover: Passion, romance, commitment, intimacy
- Jester: Fun, humor, living in the moment
- Everyman: Belonging, realism, solid virtues
- Outlaw: Revolution, rebellion, disruption

Return JSON:
{
  "primaryArchetype": {
    "name": "archetype name",
    "score": 0-100,
    "evidence": ["specific examples from content"]
  },
  "secondaryArchetype": {
    "name": "archetype name", 
    "score": 0-100
  },
  "archetypeAlignment": "assessment of consistency",
  "recommendations": [
    {
      "archetype": "suggested focus archetype",
      "rationale": "why this archetype fits the brand",
      "implementation": "how to strengthen this archetype"
    }
  ],
  "brandEvolution": "how archetypes should evolve with market trends"
}`;
  }

  parseArchetypeAnalysis(responseText) {
    try {
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);
      
      if (!parsed.primaryArchetype || !parsed.primaryArchetype.name) {
        throw new Error('Invalid response structure');
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to parse archetype analysis:', error);
      return this.getDefaultArchetypeAnalysis();
    }
  }

  getDefaultToneAnalysis() {
    return {
      scores: {
        formality: 50,
        warmth: 50,
        authority: 50,
        authenticity: 50,
        innovation: 50
      },
      dominantTone: "Analysis unavailable",
      recommendations: [],
      brandPersonality: "Unable to assess brand personality"
    };
  }

  getDefaultArchetypeAnalysis() {
    return {
      primaryArchetype: {
        name: "Unknown",
        score: 0,
        evidence: []
      },
      recommendations: [],
      brandEvolution: "Analysis unavailable"
    };
  }
}

// Chrome Extension Event Listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log('XCLV Brand Analysis Extension with Enhanced Interactive Features installed');
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'toggleAnalysis' });
});

// Enhanced message handling for content script communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeContent') {
    handleContentAnalysis(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'analyzeTextElement') {
    handleTextElementAnalysis(request.data)
      .then(result => sendResponse({ 
        success: true, 
        data: result,
        systemPrompt: result._debug?.systemPrompt || 'System prompt not available'
      }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Existing content analysis handler
async function handleContentAnalysis(contentData) {
  const brandService = new BrandAnalysisService();
  
  try {
    const toneAnalysis = await brandService.analyzeToneOfVoice(contentData.text);
    const archetypeAnalysis = await brandService.analyzeArchetypes(contentData.text);
    
    return {
      tone: toneAnalysis,
      archetypes: archetypeAnalysis,
      timestamp: Date.now(),
      url: contentData.url,
      model: 'Gemini 2.5',
      version: '1.1.0'
    };
  } catch (error) {
    console.error('Brand analysis failed:', error);
    throw new Error('Brand analysis temporarily unavailable');
  }
}

// New text element analysis handler
async function handleTextElementAnalysis(elementData) {
  const textAnalysisService = new TextElementAnalysisService();
  
  try {
    console.log('XCLV: Analyzing text element:', elementData.text.substring(0, 100) + '...');
    
    const analysis = await textAnalysisService.analyzeTextElement(elementData);
    
    console.log('XCLV: Text element analysis completed:', analysis.overallScore);
    
    return {
      ...analysis,
      timestamp: Date.now(),
      url: elementData.page.url,
      model: 'Gemini 2.5',
      version: '1.1.0',
      elementInfo: {
        tagName: elementData.element.tagName,
        textLength: elementData.element.textLength,
        context: elementData.context
      }
    };
  } catch (error) {
    console.error('Text element analysis failed:', error);
    throw new Error(`Text analysis failed: ${error.message}`);
  }
}

// Command handling for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      switch (command) {
        case 'toggle-analysis':
          chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleAnalysis' });
          break;
        case 'toggle-interactive':
          chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleInteractiveMode' });
          break;
        case 'show-panel':
          chrome.tabs.sendMessage(tabs[0].id, { action: 'showPanel' });
          break;
        case 'export-report':
          chrome.tabs.sendMessage(tabs[0].id, { action: 'exportReport' });
          break;
      }
    }
  });
});

console.log('XCLV Enhanced Background Script loaded successfully');