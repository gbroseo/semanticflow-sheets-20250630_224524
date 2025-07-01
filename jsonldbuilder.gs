function buildEntityJSONLD(entities) {
  if (!Array.isArray(entities) || entities.length === 0) {
    return [];
  }
  const result = [];
  for (let i = 0; i < entities.length; i++) {
    const e = entities[i];
    const obj = {
      '@type': e.type || 'Thing',
      name: e.matchedText || e.match || e.entityId || ''
    };
    const sameAs = [];
    if (e.wikiLink) {
      sameAs.push(e.wikiLink);
    }
    if (e.wikidataId) {
      const id = e.wikidataId;
      const wdUrl = id.startsWith('http://') || id.startsWith('https://')
        ? id
        : 'https://www.wikidata.org/wiki/' + id;
      sameAs.push(wdUrl);
    }
    if (sameAs.length > 0) {
      obj.sameAs = sameAs;
    }
    result.push(obj);
  }
  return result;
}

function buildCategoryJSONLD(categories) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return [];
  }
  const result = [];
  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    const obj = {
      '@type': 'CategoryCode',
      codeValue: c.label || c.category || '',
      name: c.label || c.category || ''
    };
    if (c.score !== undefined) {
      obj.score = c.score;
    }
    result.push(obj);
  }
  return result;
}

function buildTopicJSONLD(topics) {
  if (!Array.isArray(topics) || topics.length === 0) {
    return [];
  }
  const result = [];
  for (let i = 0; i < topics.length; i++) {
    const t = topics[i];
    const obj = {
      '@type': 'Thing',
      name: t.label || ''
    };
    const sameAs = [];
    if (t.wikiLink) {
      sameAs.push(t.wikiLink);
    }
    if (sameAs.length > 0) {
      obj.sameAs = sameAs;
    }
    if (t.score !== undefined) {
      obj.score = t.score;
    }
    result.push(obj);
  }
  return result;
}

function buildJSONLD(data) {
  if (!data || typeof data !== 'object') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': []
    }, null, 2);
  }
  const entities = Array.isArray(data.entities) ? data.entities : [];
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const topics = Array.isArray(data.topics) ? data.topics : [];
  const graph = []
    .concat(buildEntityJSONLD(entities))
    .concat(buildCategoryJSONLD(categories))
    .concat(buildTopicJSONLD(topics));
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph
  }, null, 2);
}