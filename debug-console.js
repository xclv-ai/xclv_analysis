// XCLV Enhanced Debug Console
// Add this to browser console to debug what's being sent to Gemini 2.5

// 1. First, let's see what content is being extracted
console.log("🔍 XCLV DEBUG MODE ACTIVATED");

// Function to extract content just like the extension does
function debugContentExtraction() {
  console.group("📄 CONTENT EXTRACTION DEBUG");
  
  // Same logic as your WebContentExtractor
  const contentSelectors = [
    'main', 'article', '[role="main"]',
    '.content', '.main-content', '#content',
    'p', 'h1', 'h2', 'h3'
  ];
  
  let content = '';
  contentSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el.textContent && el.textContent.trim().length > 20) {
        content += el.textContent.trim() + ' ';
      }
    });
  });
  
  content = content.trim();
  
  console.log("✅ Content length:", content.length);
  console.log("✅ Content preview (first 500 chars):");
  console.log(content.substring(0, 500));
  console.log("✅ Content preview (last 200 chars):");
  console.log(content.substring(content.length - 200));
  
  // Check for common issues
  if (content.length < 50) {
    console.warn("❌ ISSUE: Content too short for analysis");
  }
  
  if (content.includes("cookie")) {
    console.warn("⚠️ ISSUE: Content includes cookie notices");
  }
  
  console.groupEnd();
  return content;
}

// Function to test what would be sent to Gemini
function debugGeminiPrompt() {
  console.group("🚀 GEMINI PROMPT DEBUG");
  
  const content = debugContentExtraction();
  
  const systemPrompt = `You are a strategic brand analysis expert with 20+ years of experience, powered by Gemini 2.5 AI.

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
    Consider current market trends and cultural context in your analysis.`;

  const userPrompt = `Analyze the tone of voice in this content using Gemini 2.5's advanced understanding. Focus on the LiveBranding approach - how this tone positions the brand in the current cultural moment.

Content to analyze:
"""
${content.substring(0, 2000)} // Truncated for display
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

  const fullPrompt = systemPrompt + "\n\nUser Request: " + userPrompt;
  
  console.log("✅ Full prompt length:", fullPrompt.length);
  console.log("✅ System prompt preview:", systemPrompt.substring(0, 200) + "...");
  console.log("✅ User prompt preview:", userPrompt.substring(0, 300) + "...");
  
  console.groupEnd();
  return { systemPrompt, userPrompt, fullPrompt, content };
}

// Function to check API configuration
async function debugAPIConfig() {
  console.group("🔧 API CONFIGURATION DEBUG");
  
  try {
    const result = await new Promise((resolve) => {
      chrome.storage.sync.get(['geminiApiKey', 'selectedModel'], resolve);
    });
    
    console.log("✅ API Key exists:", !!(result.geminiApiKey && result.geminiApiKey.length > 10));
    console.log("✅ API Key length:", result.geminiApiKey?.length || 0);
    console.log("✅ API Key starts with AIza:", result.geminiApiKey?.startsWith('AIza') || false);
    console.log("✅ Selected model:", result.selectedModel || 'not set');
    
    if (!result.geminiApiKey) {
      console.error("❌ CRITICAL: No API key configured");
      console.log("🔧 FIX: Configure API key in extension popup");
    }
    
  } catch (error) {
    console.error("❌ Failed to check API config:", error);
  }
  
  console.groupEnd();
}

// Function to test actual API call
async function debugAPICall() {
  console.group("🌐 API CALL DEBUG");
  
  try {
    const { content } = debugGeminiPrompt();
    
    const result = await new Promise((resolve) => {
      chrome.storage.sync.get(['geminiApiKey', 'selectedModel'], resolve);
    });
    
    if (!result.geminiApiKey) {
      console.error("❌ Cannot test API - no key configured");
      console.groupEnd();
      return;
    }
    
    const model = result.selectedModel || 'gemini-2.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${result.geminiApiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: `Analyze this content and return JSON with tone scores: ${content.substring(0, 1000)}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    };
    
    console.log("✅ API URL:", apiUrl.replace(result.geminiApiKey, 'HIDDEN'));
    console.log("✅ Request body:", requestBody);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    console.log("✅ Response status:", response.status);
    console.log("✅ Response ok:", response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ API Response:", data);
      
      if (data.candidates && data.candidates[0]) {
        const content = data.candidates[0].content.parts[0].text;
        console.log("✅ Response content:", content);
        
        // Try to parse as JSON
        try {
          const parsed = JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
          console.log("✅ Parsed JSON:", parsed);
        } catch (parseError) {
          console.warn("⚠️ Failed to parse response as JSON:", parseError);
          console.log("📝 Raw content:", content);
        }
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ API Error:", errorData);
    }
    
  } catch (error) {
    console.error("❌ API Call failed:", error);
  }
  
  console.groupEnd();
}

// Run all debug functions
async function runFullDebug() {
  console.log("🚀 STARTING FULL XCLV DEBUG SEQUENCE");
  console.log("=====================================");
  
  await debugAPIConfig();
  const extracted = debugContentExtraction();
  debugGeminiPrompt();
  await debugAPICall();
  
  console.log("=====================================");
  console.log("✅ DEBUG COMPLETE - Check results above");
  
  // Summary
  console.group("📊 DEBUG SUMMARY");
  console.log("Next steps based on results:");
  console.log("1. If API key missing → Configure in popup");
  console.log("2. If content too short → Page might need different selectors");
  console.log("3. If API call fails → Check API key validity");
  console.log("4. If JSON parse fails → Gemini response format issue");
  console.groupEnd();
}

// Auto-run the debug
runFullDebug();
