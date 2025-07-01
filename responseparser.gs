function parseResponse(rawData) {
  var jsonString = rawData;
  if (rawData && typeof rawData.getContentText === 'function') {
    jsonString = rawData.getContentText();
  }
  var parsed;
  try {
    parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch (e) {
    throw new Error('Failed to parse JSON response: ' + e.message);
  }
  if (!parsed || !parsed.response) {
    var errorMessage = (parsed && parsed.error) ? parsed.error : 'Invalid API response structure';
    throw new Error('TextRazor API error: ' + errorMessage);
  }
  var response = parsed.response;
  return {
    entities: extractEntities(response),
    categories: extractCategories(response),
    topics: extractTopics(response)
  };
}

/**
 * Extracts entities from the parsed response.
 *
 * @param {Object} data - The parsed response object.
 * @return {Array<Object>} Array of entity objects.
 */
function extractEntities(data) {
  if (!data || !Array.isArray(data.entities)) return [];
  return data.entities.map(function(entity) {
    return {
      entityId: entity.entityId || '',
      matchedText: entity.matchedText || '',
      relevanceScore: typeof entity.relevanceScore === 'number' ? entity.relevanceScore : 0,
      confidenceScore: typeof entity.confidenceScore === 'number' ? entity.confidenceScore : 0,
      wikiLink: entity.wikiLink || '',
      types: Array.isArray(entity.type) ? entity.type : [],
      freebaseTypes: Array.isArray(entity.freebaseTypes) ? entity.freebaseTypes : []
    };
  });
}

/**
 * Extracts categories from the parsed response.
 *
 * @param {Object} data - The parsed response object.
 * @return {Array<Object>} Array of category objects.
 */
function extractCategories(data) {
  if (!data || !Array.isArray(data.categories)) return [];
  return data.categories.map(function(category) {
    return {
      label: category.label || '',
      score: typeof category.score === 'number' ? category.score : 0,
      wikiLink: category.wikiLink || ''
    };
  });
}

/**
 * Extracts topics from the parsed response.
 *
 * @param {Object} data - The parsed response object.
 * @return {Array<Object>} Array of topic objects.
 */
function extractTopics(data) {
  if (!data || !Array.isArray(data.topics)) return [];
  return data.topics.map(function(topic) {
    return {
      label: topic.label || '',
      score: typeof topic.score === 'number' ? topic.score : 0,
      wikiLink: topic.wikiLink || ''
    };
  });
}