document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('hyperdxConfigForm');
  var toggleSwitch = document.getElementById('enableHyperDX');
  var urlFilterToggle = document.getElementById('urlFilterEnabled');
  var urlPatternsGroup = document.getElementById('urlPatternsGroup');
  var fieldIds = ['apiKey', 'service', 'url', 'environment', 'traceTargets', 'urlPatterns'];

  function updateUrlPatternsVisibility() {
    urlPatternsGroup.style.display = urlFilterToggle.checked ? 'block' : 'none';
  }

  function readConfigFromForm() {
    var traceTargetsRaw = document.getElementById('traceTargets').value.trim();
    var tracePropagationTargets = traceTargetsRaw
      ? traceTargetsRaw.split(',').map(function (item) {
          return item.trim();
        }).filter(Boolean)
      : [];

    return {
      apiKey: document.getElementById('apiKey').value.trim(),
      service: document.getElementById('service').value.trim(),
      url: document.getElementById('url').value.trim(),
      environment: document.getElementById('environment').value.trim(),
      tracePropagationTargets: tracePropagationTargets,
      consoleCapture: document.getElementById('consoleCapture').checked,
      advancedNetworkCapture: document.getElementById('advancedNetworkCapture').checked,
      urlFilterEnabled: urlFilterToggle.checked,
      urlPatterns: hyperdxParseUrlPatterns(document.getElementById('urlPatterns').value),
    };
  }

  function saveConfig(config) {
    chrome.storage.sync.set({ hyperdxConfig: config });
  }

  chrome.storage.sync.get(['hyperdxConfig', 'hyperdxEnabled'], function (result) {
    if (result.hyperdxConfig) {
      var config = result.hyperdxConfig;
      document.getElementById('apiKey').value = config.apiKey || '';
      document.getElementById('service').value = config.service || '';
      document.getElementById('url').value = config.url || '';
      document.getElementById('environment').value = config.environment || '';
      document.getElementById('traceTargets').value = (config.tracePropagationTargets || []).join(', ');
      document.getElementById('consoleCapture').checked = Boolean(config.consoleCapture);
      document.getElementById('advancedNetworkCapture').checked = Boolean(config.advancedNetworkCapture);
      urlFilterToggle.checked = Boolean(config.urlFilterEnabled);
      document.getElementById('urlPatterns').value = (config.urlPatterns || []).join('\n');
    }

    toggleSwitch.checked = result.hyperdxEnabled !== false;
    updateUrlPatternsVisibility();
  });

  toggleSwitch.addEventListener('change', function () {
    chrome.storage.sync.set({ hyperdxEnabled: toggleSwitch.checked });
  });

  urlFilterToggle.addEventListener('change', function () {
    updateUrlPatternsVisibility();
    saveConfig(readConfigFromForm());
  });

  fieldIds.forEach(function (fieldId) {
    document.getElementById(fieldId).addEventListener('input', function () {
      saveConfig(readConfigFromForm());
    });
  });

  ['consoleCapture', 'advancedNetworkCapture'].forEach(function (fieldId) {
    document.getElementById(fieldId).addEventListener('change', function () {
      saveConfig(readConfigFromForm());
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var config = readConfigFromForm();
    if (!config.service) {
      alert('Please fill in Service Name');
      return;
    }

    if (config.urlFilterEnabled && !config.urlPatterns.length) {
      alert('Add at least one URL pattern, or turn off "Only inject on matching URLs".');
      return;
    }

    chrome.storage.sync.set({ hyperdxConfig: config }, function () {
      var button = document.getElementById('saveConfig');
      var originalText = button.textContent;
      button.textContent = 'Saved!';
      button.classList.add('saved');

      setTimeout(function () {
        button.textContent = originalText;
        button.classList.remove('saved');
      }, 2000);
    });
  });
});
