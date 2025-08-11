// XCLV Brand Analysis - Background Script
// Strategic Brand Intelligence Engine with Gemini 2.5 API

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
      // Get API key and model from storage
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

      return {
        content: data.candidates[0].content.parts[0].text
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
      // Clean response and extract JSON
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);
      
      // Validate structure
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
      
      // Validate structure
      if (!parsed.primaryArchetype || !parsed.primaryArchetype.name) {
        throw new Error('Invalid response structure');
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to parse archetype analysis:', error);
      return this.getDefaultArchetypeAnalysis();
    }
  }

  async analyzeMessageClarity(textElement) {
    const text = textElement.textContent.trim();
    const context = this.getElementContext(textElement);
    
    return this.executeAIOperation(
      { text, context },
      (data) => this.buildClarityPrompt(data),
      (response) => this.parseClarityAnalysis(response.content)
    );
  }

  buildClarityPrompt(data) {
    return `Analyze message clarity for this text element using Gemini 2.5's advanced language understanding. Focus on immediate comprehension and action-driving power.

Text: "${data.text}"
Context: ${data.context.elementType} in ${data.context.section}

Evaluate:
1. Immediate comprehension (can reader understand in 3 seconds?)
2. Action clarity (does it drive specific behavior?)
3. Emotional resonance (does it create feeling?)
4. Brand alignment (does it fit the brand voice?)
5. Cultural relevance (does it connect with current audience expectations?)

Return JSON:
{
  "clarityScore": 0-100,
  "comprehensionLevel": "immediate|quick|slow|unclear",
  "actionPotential": "high|medium|low",
  "quickInsights": [
    {
      "type": "positive|improvement|warning",
      "message": "specific insight"
    }
  ],
  "effectiveness": "high|medium|low",
  "recommendations": ["specific improvement suggestions"]
}`;
  }

  parseClarityAnalysis(responseText) {
    try {
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);
      
      // Validate structure
      if (typeof parsed.clarityScore !== 'number') {
        throw new Error('Invalid response structure');
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to parse clarity analysis:', error);
      return this.getDefaultClarityAnalysis();
    }
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
      id: id,
      position: this.getElementPosition(element)
    };
  }

  getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };
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

  getDefaultClarityAnalysis() {
    return {
      clarityScore: 0,
      comprehensionLevel: "unclear",
      actionPotential: "low",
      quickInsights: [
        {
          type: "warning",
          message: "Analysis temporarily unavailable"
        }
      ],
      effectiveness: "low",
      recommendations: []
    };
  }
}

class ToneAnalysisEngine {
  constructor() {
    this.toneVectors = {
      formality: {
        formal: [
          'respectfully', 'accordingly', 'furthermore', 'nevertheless', 'consequently',
          'moreover', 'therefore', 'subsequently', 'hereby', 'pursuant', 'aforementioned',
          'notwithstanding', 'henceforth', 'heretofore', 'wherein', 'whereby'
        ],
        casual: [
          'hey', 'awesome', 'cool', 'totally', 'yeah', 'super', 'really', 'pretty',
          'kinda', 'sorta', 'gonna', 'wanna', 'gotta', 'nope', 'yep', 'stuff'
        ]
      },
      warmth: {
        warm: [
          'welcome', 'delighted', 'pleased', 'wonderful', 'amazing', 'fantastic',
          'love', 'care', 'support', 'help', 'together', 'community', 'family',
          'heart', 'passion', 'excited', 'thrilled', 'grateful', 'appreciate'
        ],
        cold: [
          'requirements', 'compliance', 'mandatory', 'specifications', 'protocol',
          'procedure', 'regulation', 'standard', 'policy', 'guideline', 'directive',
          'obligation', 'restriction', 'limitation', 'constraint', 'parameter'
        ]
      },
      authority: {
        authoritative: [
          'proven', 'expertise', 'leading', 'industry-standard', 'certified',
          'guarantee', 'ensure', 'deliver', 'achieve', 'master', 'expert',
          'professional', 'established', 'trusted', 'reliable', 'definitive'
        ],
        humble: [
          'perhaps', 'might', 'consider', 'suggest', 'possibly', 'maybe',
          'could', 'would', 'should', 'try', 'attempt', 'explore', 'think',
          'believe', 'hope', 'wish', 'wonder', 'question', 'doubt'
        ]
      },
      authenticity: {
        authentic: [
          'honest', 'genuine', 'real', 'true', 'transparent', 'open', 'sincere',
          'authentic', 'original', 'natural', 'raw', 'unfiltered', 'direct',
          'straightforward', 'candid', 'frank', 'truthful', 'actual'
        ],
        manufactured: [
          'synergy', 'leverage', 'optimize', 'streamline', 'paradigm', 'ecosystem',
          'disruptive', 'innovative', 'cutting-edge', 'revolutionary', 'groundbreaking',
          'game-changing', 'next-generation', 'state-of-the-art', 'world-class'
        ]
      },
      innovation: {
        innovative: [
          'future', 'tomorrow', 'next', 'new', 'fresh', 'modern', 'advanced',
          'breakthrough', 'pioneer', 'evolve', 'transform', 'reimagine',
          'reinvent', 'discover', 'create', 'build', 'design', 'develop'
        ],
        traditional: [
          'established', 'proven', 'time-tested', 'traditional', 'classic',
          'heritage', 'legacy', 'history', 'experience', 'stability',
          'consistency', 'reliability', 'standard', 'conventional', 'orthodox'
        ]
      }
    };
  }

  analyzeTone(content) {
    const words = this.tokenizeContent(content);
    const scores = {};

    Object.keys(this.toneVectors).forEach(dimension => {
      scores[dimension] = this.calculateToneScore(words, dimension);
    });

    return {
      scores,
      dominantTone: this.identifyDominantTone(scores),
      recommendations: this.generateToneRecommendations(scores),
      brandPersonality: this.assessBrandPersonality(scores)
    };
  }

  tokenizeContent(content) {
    return content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  calculateToneScore(words, dimension) {
    const vectors = this.toneVectors[dimension];
    let positiveScore = 0;
    let negativeScore = 0;
    const totalWords = words.length;

    words.forEach(word => {
      const positive = Object.values(vectors)[0];
      const negative = Object.values(vectors)[1];
      
      if (positive.some(keyword => word.includes(keyword))) {
        positiveScore++;
      }
      if (negative.some(keyword => word.includes(keyword))) {
        negativeScore++;
      }
    });

    // Calculate percentage and normalize to 0-100 scale
    const total = positiveScore + negativeScore;
    if (total === 0) return 50; // Neutral if no matches
    
    const ratio = positiveScore / total;
    return Math.round(ratio * 100);
  }

  identifyDominantTone(scores) {
    const traits = [];
    
    if (scores.formality > 70) traits.push('formal');
    else if (scores.formality < 30) traits.push('casual');
    
    if (scores.warmth > 70) traits.push('warm');
    else if (scores.warmth < 30) traits.push('distant');
    
    if (scores.authority > 70) traits.push('authoritative');
    else if (scores.authority < 30) traits.push('humble');
    
    if (scores.authenticity > 70) traits.push('authentic');
    else if (scores.authenticity < 30) traits.push('corporate');
    
    if (scores.innovation > 70) traits.push('innovative');
    else if (scores.innovation < 30) traits.push('traditional');

    return traits.length > 0 ? traits.join(', ') : 'neutral';
  }

  generateToneRecommendations(scores) {
    const recommendations = [];
    
    Object.keys(scores).forEach(dimension => {
      const score = scores[dimension];
      if (score < 40 || score > 80) {
        recommendations.push(this.getToneRecommendation(dimension, score));
      }
    });

    return recommendations;
  }

  getToneRecommendation(dimension, score) {
    const recommendations = {
      formality: {
        low: "Consider adding more professional language for credibility",
        high: "Try using more conversational tone to increase approachability"
      },
      warmth: {
        low: "Add more human, emotional language to build connection",
        high: "Balance warmth with professionalism to maintain authority"
      },
      authority: {
        low: "Strengthen confidence with more decisive language",
        high: "Soften authority with collaborative language"
      },
      authenticity: {
        low: "Reduce corporate jargon and speak more naturally",
        high: "Maintain authenticity while ensuring clarity"
      },
      innovation: {
        low: "Add forward-thinking language to show market awareness",
        high: "Balance innovation focus with proven reliability"
      }
    };

    const level = score < 40 ? 'low' : 'high';
    return {
      area: dimension,
      insight: recommendations[dimension][level],
      impact: "Improved brand perception and engagement"
    };
  }

  assessBrandPersonality(scores) {
    const { formality, warmth, authority, authenticity, innovation } = scores;
    
    if (authority > 70 && formality > 70) {
      return "Executive leader with commanding presence";
    } else if (warmth > 70 && authenticity > 70) {
      return "Trusted friend who genuinely cares";
    } else if (innovation > 70 && authority > 60) {
      return "Visionary pioneer shaping the future";
    } else if (authenticity > 70 && formality < 40) {
      return "Authentic storyteller with human touch";
    } else if (warmth > 60 && authority > 60) {
      return "Knowledgeable guide with personal care";
    } else {
      return "Balanced communicator seeking clarity";
    }
  }
}

// Keep the existing ArchetypeAnalyzer class (unchanged)
class ArchetypeAnalyzer {
  constructor() {
    this.archetypes = {
      hero: {
        keywords: [
          'challenge', 'overcome', 'achieve', 'victory', 'triumph', 'conquer',
          'battle', 'fight', 'win', 'succeed', 'courage', 'brave', 'strong',
          'determination', 'perseverance', 'goal', 'mission', 'quest'
        ],
        language_patterns: [
          'we can', 'together we', 'achieve greatness', 'overcome obstacles',
          'rise above', 'push through', 'break barriers', 'make it happen'
        ],
        emotional_tone: 'inspiring',
        values: ['courage', 'determination', 'mastery', 'honor']
      },
      sage: {
        keywords: [
          'wisdom', 'knowledge', 'understand', 'insight', 'truth', 'learn',
          'discover', 'research', 'study', 'analysis', 'expertise', 'intelligence',
          'thoughtful', 'careful', 'considered', 'informed', 'educated'
        ],
        language_patterns: [
          'research shows', 'studies indicate', 'evidence suggests', 'data reveals',
          'experts believe', 'analysis demonstrates', 'findings show'
        ],
        emotional_tone: 'educational',
        values: ['truth', 'wisdom', 'understanding', 'intelligence']
      },
      explorer: {
        keywords: [
          'adventure', 'discover', 'journey', 'explore', 'freedom', 'experience',
          'travel', 'new', 'different', 'unique', 'authentic', 'real',
          'wild', 'open', 'free', 'independent', 'escape', 'wander'
        ],
        language_patterns: [
          'break free', 'new possibilities', 'venture forth', 'explore new',
          'discover yourself', 'find your path', 'journey begins'
        ],
        emotional_tone: 'adventurous',
        values: ['freedom', 'authenticity', 'experience', 'individuality']
      },
      innocent: {
        keywords: [
          'pure', 'simple', 'honest', 'genuine', 'natural', 'clean',
          'fresh', 'wholesome', 'good', 'right', 'true', 'clear',
          'bright', 'happy', 'joy', 'optimistic', 'positive', 'hope'
        ],
        language_patterns: [
          'simply', 'naturally', 'purely', 'just right', 'perfectly simple',
          'as it should be', 'the way nature intended'
        ],
        emotional_tone: 'optimistic',
        values: ['goodness', 'optimism', 'simplicity', 'faith']
      },
      ruler: {
        keywords: [
          'luxury', 'premium', 'exclusive', 'elite', 'prestige', 'finest',
          'superior', 'excellence', 'quality', 'sophisticated', 'refined',
          'distinguished', 'prestigious', 'respected', 'established', 'legacy'
        ],
        language_patterns: [
          'the finest', 'exclusively for', 'premium quality', 'superior performance',
          'uncompromising excellence', 'distinguished by', 'setting the standard'
        ],
        emotional_tone: 'authoritative',
        values: ['power', 'responsibility', 'excellence', 'sophistication']
      },
      creator: {
        keywords: [
          'create', 'design', 'build', 'make', 'craft', 'artistic', 'creative',
          'imagination', 'vision', 'express', 'original', 'unique', 'innovative',
          'inspire', 'beauty', 'art', 'style', 'personal', 'individual'
        ],
        language_patterns: [
          'express yourself', 'unleash creativity', 'bring vision to life',
          'craft something unique', 'design your world', 'create beauty'
        ],
        emotional_tone: 'imaginative',
        values: ['creativity', 'imagination', 'artistic value', 'self-expression']
      },
      caregiver: {
        keywords: [
          'care', 'help', 'support', 'nurture', 'protect', 'serve', 'heal',
          'comfort', 'safety', 'security', 'family', 'love', 'compassion',
          'kindness', 'gentle', 'warm', 'understanding', 'patient'
        ],
        language_patterns: [
          'we care for', 'here to help', 'supporting you', 'taking care of',
          'protecting what matters', 'nurturing growth', 'always there'
        ],
        emotional_tone: 'caring',
        values: ['caring', 'compassion', 'generosity', 'service']
      },
      magician: {
        keywords: [
          'transform', 'magic', 'amazing', 'incredible', 'extraordinary',
          'revolutionary', 'breakthrough', 'impossible', 'vision', 'dream',
          'miracle', 'wonder', 'special', 'mystical', 'powerful', 'change'
        ],
        language_patterns: [
          'transform your', 'make dreams reality', 'impossible becomes possible',
          'revolutionary change', 'magical transformation', 'beyond imagination'
        ],
        emotional_tone: 'transformative',
        values: ['transformation', 'vision', 'power', 'charisma']
      },
      lover: {
        keywords: [
          'love', 'passion', 'romantic', 'beautiful', 'sensual', 'intimate',
          'desire', 'attraction', 'relationship', 'connection', 'devotion',
          'commitment', 'heart', 'soul', 'emotion', 'feeling', 'pleasure'
        ],
        language_patterns: [
          'fall in love', 'passionate about', 'beautiful experience',
          'deep connection', 'heartfelt', 'soul stirring', 'irresistibly'
        ],
        emotional_tone: 'passionate',
        values: ['love', 'passion', 'commitment', 'beauty']
      },
      jester: {
        keywords: [
          'fun', 'funny', 'humor', 'laugh', 'play', 'enjoy', 'entertaining',
          'amusing', 'witty', 'clever', 'silly', 'crazy', 'wild', 'spontaneous',
          'surprise', 'delight', 'joy', 'party', 'celebration', 'energy'
        ],
        language_patterns: [
          'have fun', 'laugh out loud', 'enjoy life', 'party time',
          'let loose', 'be yourself', 'live it up', 'good times'
        ],
        emotional_tone: 'playful',
        values: ['fun', 'humor', 'spontaneity', 'lightness']
      },
      everyman: {
        keywords: [
          'normal', 'ordinary', 'regular', 'common', 'everyday', 'practical',
          'real', 'honest', 'straightforward', 'reliable', 'dependable',
          'trustworthy', 'down-to-earth', 'genuine', 'authentic', 'simple'
        ],
        language_patterns: [
          'just like you', 'real people', 'everyday life', 'common sense',
          'straight talk', 'honest value', 'practical solution'
        ],
        emotional_tone: 'relatable',
        values: ['belonging', 'common sense', 'realism', 'solid virtues']
      },
      outlaw: {
        keywords: [
          'rebel', 'revolution', 'break', 'disrupt', 'challenge', 'fight',
          'change', 'different', 'alternative', 'unconventional', 'bold',
          'daring', 'edgy', 'radical', 'independent', 'free', 'wild'
        ],
        language_patterns: [
          'break the rules', 'challenge convention', 'disrupt the status quo',
          'fight the system', 'rebel against', 'change everything'
        ],
        emotional_tone: 'rebellious',
        values: ['rebellion', 'revolution', 'freedom', 'disruption']
      }
    };
  }

  analyzeArchetypes(content) {
    const results = {};
    
    Object.keys(this.archetypes).forEach(archetype => {
      results[archetype] = this.calculateArchetypeScore(content, archetype);
    });

    const sortedResults = Object.entries(results)
      .sort(([,a], [,b]) => b.score - a.score);

    return {
      scores: results,
      primaryArchetype: {
        name: sortedResults[0][0],
        score: sortedResults[0][1].score,
        evidence: sortedResults[0][1].evidence
      },
      secondaryArchetype: {
        name: sortedResults[1][0],
        score: sortedResults[1][1].score
      },
      archetypeAlignment: this.assessAlignment(sortedResults),
      recommendations: this.generateArchetypeRecommendations(sortedResults),
      brandEvolution: this.suggestEvolution(sortedResults)
    };
  }

  calculateArchetypeScore(content, archetypeKey) {
    const archetype = this.archetypes[archetypeKey];
    const words = content.toLowerCase().split(/\s+/);
    const sentences = content.split(/[.!?]+/);
    
    let score = 0;
    const evidence = [];
    
    // Keyword matching (weight: 2)
    archetype.keywords.forEach(keyword => {
      const matches = words.filter(word => word.includes(keyword)).length;
      if (matches > 0) {
        score += matches * 2;
        evidence.push(`Found "${keyword}" language`);
      }
    });

    // Pattern matching (weight: 5)
    archetype.language_patterns.forEach(pattern => {
      sentences.forEach(sentence => {
        if (sentence.toLowerCase().includes(pattern)) {
          score += 5;
          evidence.push(`Pattern: "${pattern}"`);
        }
      });
    });

    // Emotional tone matching (weight: 3)
    const toneWords = this.getToneWords(archetype.emotional_tone);
    toneWords.forEach(toneWord => {
      if (content.toLowerCase().includes(toneWord)) {
        score += 3;
        evidence.push(`Emotional tone: "${toneWord}"`);
      }
    });

    return {
      score: Math.min(score, 100),
      evidence: evidence.slice(0, 3) // Top 3 pieces of evidence
    };
  }

  getToneWords(emotionalTone) {
    const toneMapping = {
      inspiring: ['motivate', 'inspire', 'uplift', 'empower', 'energize'],
      educational: ['learn', 'understand', 'discover', 'knowledge', 'insight'],
      adventurous: ['exciting', 'thrilling', 'bold', 'daring', 'adventurous'],
      optimistic: ['positive', 'bright', 'hopeful', 'cheerful', 'upbeat'],
      authoritative: ['confident', 'decisive', 'commanding', 'powerful', 'strong'],
      imaginative: ['creative', 'innovative', 'visionary', 'artistic', 'original'],
      caring: ['supportive', 'nurturing', 'protective', 'loving', 'gentle'],
      transformative: ['revolutionary', 'transformative', 'magical', 'extraordinary'],
      passionate: ['passionate', 'intense', 'romantic', 'devoted', 'heartfelt'],
      playful: ['playful', 'fun', 'entertaining', 'lively', 'spirited'],
      relatable: ['relatable', 'genuine', 'authentic', 'honest', 'real'],
      rebellious: ['bold', 'daring', 'unconventional', 'edgy', 'radical']
    };
    
    return toneMapping[emotionalTone] || [];
  }

  assessAlignment(sortedResults) {
    const topScore = sortedResults[0][1].score;
    const secondScore = sortedResults[1][1].score;
    const gap = topScore - secondScore;
    
    if (topScore > 70 && gap > 30) {
      return "Strong single archetype alignment";
    } else if (topScore > 50 && gap < 20) {
      return "Mixed archetype signals - needs focus";
    } else if (topScore < 50) {
      return "Weak archetype presence - opportunity for stronger positioning";
    } else {
      return "Moderate archetype alignment with room for strengthening";
    }
  }

  generateArchetypeRecommendations(sortedResults) {
    const primary = sortedResults[0];
    const secondary = sortedResults[1];
    
    return [
      {
        archetype: primary[0],
        rationale: `Strengthen ${primary[0]} archetype to create clearer brand positioning`,
        implementation: this.getImplementationGuidance(primary[0])
      },
      {
        archetype: secondary[0],
        rationale: `Consider ${secondary[0]} as secondary archetype for depth`,
        implementation: this.getImplementationGuidance(secondary[0])
      }
    ];
  }

  getImplementationGuidance(archetypeName) {
    const guidance = {
      hero: "Use more action-oriented language, success stories, and challenge-overcome narratives",
      sage: "Include more educational content, research citations, and thought leadership",
      explorer: "Emphasize discovery, new experiences, and authentic adventures",
      innocent: "Focus on simplicity, purity, and optimistic messaging",
      ruler: "Highlight luxury, exclusivity, and premium positioning",
      creator: "Showcase creativity, artistic value, and self-expression",
      caregiver: "Emphasize support, care, and helping others",
      magician: "Use transformation stories and revolutionary language",
      lover: "Include passionate, beautiful, and relationship-focused content",
      jester: "Add humor, fun elements, and playful interactions",
      everyman: "Use relatable, honest, and down-to-earth communication",
      outlaw: "Embrace disruption, challenge conventions, and bold statements"
    };
    
    return guidance[archetypeName] || "Focus on authentic brand expression";
  }

  suggestEvolution(sortedResults) {
    const primary = sortedResults[0][0];
    
    const evolutionSuggestions = {
      hero: "Evolve from individual achievement to collective empowerment",
      sage: "Blend traditional wisdom with cutting-edge insights",
      explorer: "Balance adventure with sustainability and responsibility",
      innocent: "Maintain purity while addressing complex modern realities",
      ruler: "Combine luxury with accessibility and social consciousness",
      creator: "Merge artistic vision with practical utility",
      caregiver: "Expand from protection to empowerment",
      magician: "Ground transformation in tangible, measurable outcomes",
      lover: "Broaden from romantic to all forms of meaningful connection",
      jester: "Use humor to address serious topics thoughtfully",
      everyman: "Elevate ordinary to extraordinary without losing relatability",
      outlaw: "Channel rebellion into positive social change"
    };
    
    return evolutionSuggestions[primary] || "Continuously adapt archetype expression to cultural evolution";
  }
}

// Chrome Extension Event Listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log('XCLV Brand Analysis Extension with Gemini 2.5 installed');
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'toggleAnalysis' });
});

// Message handling for content script communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeContent') {
    handleContentAnalysis(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Will respond asynchronously
  }
});

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
      version: '2.5'
    };
  } catch (error) {
    console.error('Brand analysis failed:', error);
    throw new Error('Brand analysis temporarily unavailable');
  }
}