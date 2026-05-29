var hyperdxBundlePromise = null;

function isExtensionContextValid() {
  try {
    return Boolean(chrome.runtime && chrome.runtime.id);
  } catch (error) {
    return false;
  }
}

function appendPageScript(script) {
  (document.documentElement || document.head || document.body).appendChild(script);
}

function fetchExtensionResource(path) {
  var url = chrome.runtime.getURL(path);
  return fetch(url).then(function (response) {
    if (!response.ok) {
      throw new Error('Failed to fetch ' + path + ' (' + response.status + ')');
    }
    return response.text();
  });
}

function loadHyperDXSources() {
  if (!isExtensionContextValid()) {
    return Promise.reject(
      new Error('Extension context invalidated — reload the extension and refresh this tab'),
    );
  }

  if (!hyperdxBundlePromise) {
    hyperdxBundlePromise = Promise.all([
      fetchExtensionResource('js/hyperdx-browser.bundle.js'),
      fetchExtensionResource('js/pageInit.js'),
    ]).catch(function (error) {
      hyperdxBundlePromise = null;
      throw error;
    });
  }

  return hyperdxBundlePromise;
}

function injectViaExternalScripts(config) {
  return new Promise(function (resolve, reject) {
    var bundleScript = document.createElement('script');
    bundleScript.src = chrome.runtime.getURL('js/hyperdx-browser.bundle.js');

    bundleScript.onload = function () {
      var initScript = document.createElement('script');
      initScript.src = chrome.runtime.getURL('js/pageInit.js');
      initScript.dataset.params = JSON.stringify(config);

      initScript.onload = function () {
        initScript.remove();
        resolve();
      };

      initScript.onerror = function () {
        reject(new Error('Failed to load pageInit.js from extension'));
      };

      appendPageScript(initScript);
      bundleScript.remove();
    };

    bundleScript.onerror = function () {
      reject(new Error('Failed to load hyperdx-browser.bundle.js from extension'));
    };

    appendPageScript(bundleScript);
  });
}

function injectViaInlineScripts(config) {
  return loadHyperDXSources().then(function (sources) {
    var script = document.createElement('script');
    script.textContent =
      sources[0] +
      '\n;' +
      sources[1] +
      '\nhyperdxExtensionInit(' +
      JSON.stringify(config) +
      ');';

    appendPageScript(script);
    script.remove();
  });
}

function injectHyperDXScript(config) {
  injectViaExternalScripts(config)
    .then(function () {
      console.log('[HyperDX Extension] Injected via extension scripts');
    })
    .catch(function (externalError) {
      console.log(
        '[HyperDX Extension] Extension script injection failed, trying inline fallback',
        externalError.message,
      );

      return injectViaInlineScripts(config).then(function () {
        console.log('[HyperDX Extension] Injected via inline fallback');
      });
    })
    .catch(function (error) {
      console.warn('[HyperDX Extension] Failed to inject HyperDX SDK', error);
    });
}

function shouldInjectOnUrl(config, pageUrl) {
  if (!config.urlFilterEnabled) {
    return true;
  }

  var patterns = config.urlPatterns || [];
  if (!patterns.length) {
    console.warn('[HyperDX Extension] URL filter enabled but no patterns configured');
    return false;
  }

  var matches = hyperdxUrlMatches(pageUrl, patterns);
  if (!matches) {
    console.log('[HyperDX Extension] Skipping injection — URL does not match filter:', pageUrl);
  }
  return matches;
}

function checkAndInject() {
  if (window.__HYPERDX_CONTENT_INJECTED__) {
    return;
  }
  window.__HYPERDX_CONTENT_INJECTED__ = true;

  if (!isExtensionContextValid()) {
    console.warn(
      '[HyperDX Extension] Extension context invalidated — reload the extension at chrome://extensions and refresh this tab',
    );
    return;
  }

  chrome.storage.sync.get(['hyperdxConfig', 'hyperdxEnabled'], function (result) {
    if (chrome.runtime.lastError) {
      console.warn('[HyperDX Extension] Storage error:', chrome.runtime.lastError);
      return;
    }

    console.log('[HyperDX Extension] Checking configuration:', result);

    if (result.hyperdxEnabled === false) {
      console.log('[HyperDX Extension] HyperDX is disabled');
      return;
    }

    var config = result.hyperdxConfig;
    if (!config || !config.service) {
      console.warn('[HyperDX Extension] Missing service name in configuration:', config);
      return;
    }

    if (!shouldInjectOnUrl(config, location.href)) {
      return;
    }

    console.log('[HyperDX Extension] Configuration valid, injecting HyperDX');
    injectHyperDXScript(config);
  });
}

function runWhenDocumentReady(callback) {
  if (document.documentElement) {
    callback();
    return;
  }
  document.addEventListener('DOMContentLoaded', callback, { once: true });
}

runWhenDocumentReady(checkAndInject);
