// Runs in the page context after hyperdx-browser.bundle.js has loaded.
function hyperdxExtensionInit(config) {
  if (window.__HYPERDX_PAGE_INJECTED__) {
    return;
  }
  window.__HYPERDX_PAGE_INJECTED__ = true;

  if (!window.HyperDX) {
    console.warn('[HyperDX Extension] HyperDX SDK missing after bundle load');
    return;
  }

  var initOptions = {
    service: config.service,
  };

  if (config.apiKey) {
    initOptions.apiKey = config.apiKey;
  }

  if (config.url) {
    initOptions.url = config.url;
  }

  if (config.tracePropagationTargets && config.tracePropagationTargets.length) {
    initOptions.tracePropagationTargets = config.tracePropagationTargets.map(function (pattern) {
      var trimmed = pattern.trim();
      if (trimmed.charAt(0) === '/' && trimmed.lastIndexOf('/') > 0) {
        var lastSlash = trimmed.lastIndexOf('/');
        return new RegExp(trimmed.slice(1, lastSlash), trimmed.slice(lastSlash + 1));
      }
      return new RegExp(trimmed);
    });
  }

  if (config.consoleCapture) {
    initOptions.consoleCapture = true;
  }

  if (config.advancedNetworkCapture) {
    initOptions.advancedNetworkCapture = true;
  }

  if (config.environment) {
    initOptions.otelResourceAttributes = {
      'deployment.environment': config.environment,
    };
  }

  try {
    window.HyperDX.init(initOptions);
    console.log('[HyperDX Extension] HyperDX initialized');
  } catch (error) {
    console.warn('[HyperDX Extension] HyperDX init failed', error);
  }
}

(function runHyperDXPageInit() {
  var script = document.currentScript;
  if (!script || !script.dataset.params) {
    return;
  }

  try {
    hyperdxExtensionInit(JSON.parse(script.dataset.params));
  } catch (error) {
    console.warn('[HyperDX Extension] Failed to parse init config', error);
  }
})();
