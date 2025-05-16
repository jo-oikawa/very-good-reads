// Recommendations API service
// This file handles communication with LLM APIs for book recommendations

// Cache for storing recommendation results to avoid duplicate API calls
const recommendationsCache = new Map();

// Debug flag - set to true to see detailed logs
const DEBUG = true;

/**
 * Request book recommendations from an LLM API
 * @param {Object} params - Parameters for the recommendation request
 * @param {string} params.type - Type of recommendation ('to-read', 'based-on-history', 'custom')
 * @param {Array} [params.readingHistory] - User's reading history (for 'based-on-history' type)
 * @param {Array} [params.toReadList] - User's to-read list (for 'to-read' type)
 * @param {string} [params.customRequest] - Custom recommendation request (for 'custom' type)
 * @param {number} [params.count=3] - Number of recommendations to request
 * @returns {Promise<Array>} - Promise resolving to an array of book recommendations
 */
export const getRecommendations = async (params) => {
  try {
    if (DEBUG) console.log('🔍 getRecommendations called with params:', params);
    
    const { type, readingHistory, toReadList, customRequest, count = 3 } = params;
    
    // Create a cache key based on request parameters
    const cacheKey = JSON.stringify(params);
    
    // Return cached recommendations if available
    if (recommendationsCache.has(cacheKey)) {
      if (DEBUG) console.log('📋 Returning cached recommendations for:', type);
      return recommendationsCache.get(cacheKey);
    }
    
    // Prepare the prompt based on recommendation type
    let prompt = '';
    
    switch (type) {
      case 'to-read':
        prompt = `I have the following books on my to-read list. Please recommend ${count} books from this list that I should read next, with a brief explanation why:\n${JSON.stringify(toReadList)}`;
        break;
      
      case 'based-on-history':
        prompt = `Based on my reading history and ratings, please recommend ${count} new books I might enjoy, with explanations:\n${JSON.stringify(readingHistory)}`;
        break;
      
      case 'custom':
        prompt = customRequest + `\nPlease recommend ${count} books that match this request, with brief explanations.`;
        break;
      
      default:
        throw new Error('Invalid recommendation type');
    }
    
    if (DEBUG) console.log('📝 Generated prompt:', prompt);
    
    // Call LLM service
    const response = await callLLMService(prompt);
    if (DEBUG) console.log('📊 Raw LLM response received:', response);
    
    // Process and format the recommendations
    const recommendations = processRecommendations(response);
    if (DEBUG) console.log('✅ Processed recommendations:', recommendations);
    
    // Store in cache
    recommendationsCache.set(cacheKey, recommendations);
    
    return recommendations;
    
  } catch (error) {
    console.error('❌ Error getting recommendations:', error);
    return {
      recommendations: [],
      error: 'Failed to get recommendations: ' + error.message
    };
  }
};

/**
 * Makes the actual call to your chosen LLM API service
 * @param {string} prompt - The prompt to send to the LLM
 * @returns {Promise<Object>} - Promise resolving to the LLM response
 */
const callLLMService = async (prompt) => {
  // Get configuration from environment variables
  const endpoint = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.REACT_APP_AZURE_OPENAI_API_KEY;
  const deploymentName = process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT_NAME;
  const apiVersion = process.env.REACT_APP_AZURE_OPENAI_API_VERSION;

  // For Azure, the model version is included in the deployment name, not as a separate parameter
  const apiUrl = `${endpoint}openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
  if (DEBUG) console.log('🌐 Calling Azure OpenAI API at:', apiUrl);

  try {
    const formattedPrompt = formatPromptForLLM(prompt);
    if (DEBUG) console.log('📝 Formatted prompt:', formattedPrompt);

    const requestBody = {
      messages: [
        {
          role: "system",
          content: "You are a helpful book recommendation assistant. Respond with book recommendations in valid JSON format only."
        },
        {
          role: "user",
          content: formattedPrompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    };
    if (DEBUG) console.log('📦 Request payload:', requestBody);

    console.log(`🔄 Making API request to ${apiUrl}`);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (DEBUG) console.log(`📥 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Azure API error response:', errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (DEBUG) console.log('📄 Azure API response data:', data);

    if (!data.choices || data.choices.length === 0) {
      throw new Error('Empty response from Azure OpenAI API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error calling Azure OpenAI service:', error.message);

    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.error('🔌 Network error detected. Check your internet connection.');
    }

    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('🔑 Authentication error. Your API key may be invalid or expired.');
    }

    if (error.message.includes('model not found')) {
      console.error('🔍 Model not found. The deployment name may be incorrect.');
    }

    console.log('🔄 Falling back to mock data due to error');
    if (prompt.includes('to-read list')) {
      return mockToReadRecommendations;
    } else if (prompt.includes('reading history')) {
      return mockHistoryRecommendations;
    } else {
      return mockCustomRecommendations;
    }
  }
};

/**
 * Format the prompt for better LLM response quality
 * @param {string} prompt - The original prompt
 * @returns {string} - Formatted prompt
 */
const formatPromptForLLM = (prompt) => {
  return `${prompt}

Please provide recommendations in the following JSON format:
[
  {
    "title": "Book Title 1",
    "author": "Author Name 1",
    "reason": "Brief explanation of why this book is recommended"
  },
  {
    "title": "Book Title 2",
    "author": "Author Name 2",
    "reason": "Brief explanation of why this book is recommended"
  }
]`;
};

/**
 * Process and format the LLM response into a standardized recommendation format
 * @param {string|Array} response - The raw LLM API response
 * @returns {Array} - Formatted recommendations
 */
const processRecommendations = (response) => {
  // If response is already in our expected format (mock data), return it directly
  if (Array.isArray(response) && response.length > 0 && response[0].title) {
    return response;
  }

  try {
    // Try to extract JSON from the text response
    const textResponse = typeof response === 'string' ? response : JSON.stringify(response);
    
    // Find JSON array in the response text
    const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const jsonString = jsonMatch[0];
      const recommendations = JSON.parse(jsonString);
      
      // Validate and clean up the recommendations
      return recommendations.map(rec => ({
        title: rec.title || 'Unknown Title',
        author: rec.author || 'Unknown Author',
        reason: rec.reason || 'Recommended based on your preferences'
      })).slice(0, 5); // Limit to 5 recommendations max
    }
    
    // If no JSON found, try to parse the text into a structured format
    console.log('No valid JSON found in response, attempting to parse text');
    return parseTextRecommendations(textResponse);
  } catch (error) {
    console.error('Error processing recommendations:', error);
    // Fall back to mock data if parsing fails
    return [
      {
        title: "Error Processing Recommendations",
        author: "System",
        reason: "There was an error processing the recommendations. Please try again later."
      }
    ];
  }
};

/**
 * Attempt to parse unstructured text into recommendation objects
 * @param {string} text - Unstructured text response from LLM
 * @returns {Array} - Array of recommendation objects
 */
const parseTextRecommendations = (text) => {
  // Simple heuristic to identify book recommendations from text
  const recommendations = [];
  
  // Split by numbered items or linebreaks
  const sections = text.split(/\d+\.\s|\n\n/);
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    // Try to extract title and author
    let title = 'Unknown Title';
    let author = 'Unknown Author';
    let reason = section.trim();
    
    // Look for patterns like "Title by Author"
    const titleByAuthorMatch = section.match(/(["']?)(.+?)\1\s+by\s+([\w\s\.]+)/i);
    if (titleByAuthorMatch) {
      title = titleByAuthorMatch[2].trim();
      author = titleByAuthorMatch[3].trim();
      
      // Everything after this might be the reason
      const afterAuthor = section.substring(section.indexOf(author) + author.length);
      if (afterAuthor) {
        reason = afterAuthor.replace(/^[:\s-]+/, '').trim();
      }
    }
    
    // Only add if we have meaningful content
    if (title !== 'Unknown Title' || author !== 'Unknown Author') {
      recommendations.push({ title, author, reason });
    }
  }
  
  return recommendations.length > 0 ? recommendations : mockCustomRecommendations;
};

// Mock data for development purposes
const mockToReadRecommendations = [
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    reason: "This science fiction novel has similar themes to other books on your to-read list. It features problem-solving and adventure elements that match your interests."
  },
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    reason: "Based on your interest in psychological thrillers, this mystery novel would be an excellent next read with its unpredictable plot twists."
  },
  {
    title: "Educated",
    author: "Tara Westover",
    reason: "This memoir would diversify your reading with a powerful non-fiction narrative about resilience and self-education."
  }
];

const mockHistoryRecommendations = [
  {
    title: "The Song of Achilles",
    author: "Madeline Miller",
    reason: "Based on your 5-star rating of 'Circe', you would likely enjoy this earlier work by the same author that reimagines Greek mythology."
  },
  {
    title: "The Night Circus",
    author: "Erin Morgenstern",
    reason: "Your ratings show you enjoy magical realism and atmospheric writing similar to what you'll find in this enchanting novel."
  },
  {
    title: "Station Eleven",
    author: "Emily St. John Mandel",
    reason: "This post-apocalyptic novel has the literary quality you've rated highly in other books, with interconnected storylines and rich character development."
  }
];

const mockCustomRecommendations = [
  {
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    reason: "This thoughtful science fiction novel explores artificial intelligence and what it means to be human, matching your request for philosophical sci-fi."
  },
  {
    title: "The Ministry for the Future",
    author: "Kim Stanley Robinson",
    reason: "This near-future novel about climate change combines speculative fiction with realistic policy discussions, perfect for your interest in climate fiction."
  },
  {
    title: "Piranesi",
    author: "Susanna Clarke",
    reason: "This atmospheric, mysterious novel features a strange, labyrinthine house that would appeal to your request for books with unique settings."
  }
];