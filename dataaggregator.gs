function normalizeEntity(entity) {
  if (!entity) return null;
  var id = entity.id || entity.entityId || entity.matchedText || entity.name;
  if (!id) return null;
  var name = entity.matchedText || entity.entity || entity.name || id;
  var count = typeof entity.count === 'number' ? entity.count : 1;
  var relevanceScore = typeof entity.relevanceScore === 'number' ? entity.relevanceScore : 0;
  var confidenceScore = typeof entity.confidenceScore === 'number' ? entity.confidenceScore : 0;
  return { id: id, name: name, count: count, relevanceScore: relevanceScore, confidenceScore: confidenceScore };
}

function normalizeCategory(cat) {
  if (!cat) return null;
  var id = cat.id || cat.label;
  if (!id) return null;
  var label = cat.label || cat.id || id;
  var score = typeof cat.score === 'number' ? cat.score : 0;
  return { id: id, label: label, score: score };
}

function aggregateEntities(entitiesList) {
  var entityMap = {};
  entitiesList.forEach(function(list) {
    if (!Array.isArray(list)) return;
    var seenInList = {};
    list.forEach(function(entity) {
      var norm = normalizeEntity(entity);
      if (!norm) return;
      var id = norm.id;
      var rec = entityMap[id];
      if (!rec) {
        rec = { id: id, name: norm.name, totalCount: 0, pagesCount: 0, totalRelevanceScore: 0, totalConfidenceScore: 0 };
        entityMap[id] = rec;
      }
      if (!seenInList[id]) {
        rec.pagesCount++;
        seenInList[id] = true;
      }
      rec.totalCount += norm.count;
      rec.totalRelevanceScore += norm.relevanceScore;
      rec.totalConfidenceScore += norm.confidenceScore;
    });
  });
  var result = [];
  for (var key in entityMap) {
    var rec = entityMap[key];
    var avgRelevanceScore = rec.pagesCount > 0 ? rec.totalRelevanceScore / rec.pagesCount : 0;
    var avgConfidenceScore = rec.pagesCount > 0 ? rec.totalConfidenceScore / rec.pagesCount : 0;
    result.push({
      id: rec.id,
      name: rec.name,
      totalCount: rec.totalCount,
      pagesCount: rec.pagesCount,
      avgRelevanceScore: avgRelevanceScore,
      avgConfidenceScore: avgConfidenceScore
    });
  }
  result.sort(function(a, b) {
    return b.totalCount - a.totalCount;
  });
  return result;
}

function aggregateCategories(categoriesList) {
  var categoryMap = {};
  categoriesList.forEach(function(list) {
    if (!Array.isArray(list)) return;
    var seenInList = {};
    list.forEach(function(cat) {
      var norm = normalizeCategory(cat);
      if (!norm) return;
      var id = norm.id;
      var rec = categoryMap[id];
      if (!rec) {
        rec = { id: id, label: norm.label, totalCategoryScore: 0, pagesCount: 0 };
        categoryMap[id] = rec;
      }
      if (!seenInList[id]) {
        rec.pagesCount++;
        seenInList[id] = true;
      }
      rec.totalCategoryScore += norm.score;
    });
  });
  var result = [];
  for (var key in categoryMap) {
    var rec = categoryMap[key];
    var avgCategoryScore = rec.pagesCount > 0 ? rec.totalCategoryScore / rec.pagesCount : 0;
    result.push({
      id: rec.id,
      label: rec.label,
      totalCategoryScore: rec.totalCategoryScore,
      pagesCount: rec.pagesCount,
      avgCategoryScore: avgCategoryScore
    });
  }
  result.sort(function(a, b) {
    return b.totalCategoryScore - a.totalCategoryScore;
  });
  return result;
}

function computeEntityGap(pageEntitiesMap, mainPageKey) {
  if (typeof pageEntitiesMap !== 'object' || pageEntitiesMap === null) return [];
  if (!mainPageKey || !pageEntitiesMap.hasOwnProperty(mainPageKey)) {
    throw new Error('computeEntityGap: mainPageKey is required and must exist in pageEntitiesMap');
  }
  var mainEntities = pageEntitiesMap[mainPageKey];
  if (!Array.isArray(mainEntities)) return [];
  var competitorKeys = Object.keys(pageEntitiesMap).filter(function(key) {
    return key !== mainPageKey && Array.isArray(pageEntitiesMap[key]);
  });
  var competitorCount = competitorKeys.length;
  if (competitorCount === 0) return [];
  var mainSet = {};
  mainEntities.forEach(function(entity) {
    var norm = normalizeEntity(entity);
    if (norm) mainSet[norm.id] = true;
  });
  var coverageMap = {};
  competitorKeys.forEach(function(key) {
    var list = pageEntitiesMap[key];
    var seenInPage = {};
    list.forEach(function(entity) {
      var norm = normalizeEntity(entity);
      if (!norm) return;
      var id = norm.id;
      if (!coverageMap[id]) {
        coverageMap[id] = { id: id, name: norm.name, occurrenceCount: 0, totalCount: 0, totalRelevanceScore: 0, totalConfidenceScore: 0 };
      }
      var rec = coverageMap[id];
      if (!seenInPage[id]) {
        rec.occurrenceCount++;
        seenInPage[id] = true;
      }
      rec.totalCount += norm.count;
      rec.totalRelevanceScore += norm.relevanceScore;
      rec.totalConfidenceScore += norm.confidenceScore;
    });
  });
  var gap = [];
  for (var key in coverageMap) {
    if (mainSet[key]) continue;
    var rec = coverageMap[key];
    var competitorCoverage = rec.occurrenceCount / competitorCount;
    var avgRelevanceScore = rec.occurrenceCount > 0 ? rec.totalRelevanceScore / rec.occurrenceCount : 0;
    var avgConfidenceScore = rec.occurrenceCount > 0 ? rec.totalConfidenceScore / rec.occurrenceCount : 0;
    gap.push({
      id: rec.id,
      name: rec.name,
      competitorOccurrences: rec.occurrenceCount,
      competitorCoverage: competitorCoverage,
      totalCount: rec.totalCount,
      avgRelevanceScore: avgRelevanceScore,
      avgConfidenceScore: avgConfidenceScore
    });
  }
  gap.sort(function(a, b) {
    return b.competitorCoverage - a.competitorCoverage;
  });
  return gap;
}