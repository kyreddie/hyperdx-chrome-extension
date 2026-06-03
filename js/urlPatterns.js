/**
 * Match a page URL against Chrome-style match patterns.
 * Examples: http://homedepot.com/*, *://*.homedepot.com/*, https://localhost:3000/*
 */
function hyperdxMatchSinglePattern(pattern, pageUrl) {
  if (!pattern) {
    return false;
  }

  var page;
  try {
    page = new URL(pageUrl);
  } catch (error) {
    return false;
  }

  var normalized = pattern.trim();
  if (!normalized) {
    return false;
  }

  if (normalized.indexOf('://') === -1) {
    normalized = '*://' + normalized;
  }

  if (!normalized.endsWith('/*') && normalized.indexOf('/', normalized.indexOf('://') + 3) === -1) {
    normalized = normalized + '/*';
  }

  var schemeEnd = normalized.indexOf('://');
  var schemePart = normalized.slice(0, schemeEnd);
  var rest = normalized.slice(schemeEnd + 3);
  var slashIndex = rest.indexOf('/');

  var hostPart;
  var pathPart;
  if (slashIndex === -1) {
    hostPart = rest;
    pathPart = '/';
  } else {
    hostPart = rest.slice(0, slashIndex);
    pathPart = rest.slice(slashIndex);
  }

  var pageScheme = page.protocol.replace(':', '');
  if (schemePart !== '*' && schemePart !== pageScheme) {
    return false;
  }

  if (!hyperdxHostMatches(hostPart, page.hostname)) {
    return false;
  }

  return hyperdxPathMatches(pathPart, page.pathname + page.search + page.hash);
}

function hyperdxHostMatches(patternHost, hostname) {
  if (patternHost === '*') {
    return true;
  }

  if (patternHost.indexOf('*.') === 0) {
    var suffix = patternHost.slice(1);
    return hostname === patternHost.slice(2) || hostname.endsWith(suffix);
  }

  return patternHost === hostname;
}

function hyperdxPathMatches(patternPath, pagePath) {
  if (patternPath === '/*') {
    return true;
  }

  if (patternPath.endsWith('/*')) {
    var prefix = patternPath.slice(0, -1);
    return pagePath === prefix.slice(0, -1) || pagePath.indexOf(prefix) === 0;
  }

  return pagePath === patternPath;
}

function hyperdxUrlMatches(pageUrl, patterns) {
  if (!patterns || !patterns.length) {
    return false;
  }

  return patterns.some(function (pattern) {
    return hyperdxMatchSinglePattern(pattern, pageUrl);
  });
}

function hyperdxParseUrlPatterns(text) {
  if (!text || !text.trim()) {
    return [];
  }

  return text
    .split(/[\n,]+/)
    .map(function (item) {
      return item.trim();
    })
    .filter(Boolean);
}
