// Tabwai - Background Service Worker (Manifest V3)
// Configures dynamic rules and handles cross-origin Wallhaven API requests

function setupDNRRules() {
  if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.updateDynamicRules) {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1, 2],
      addRules: [
        {
          id: 1,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            responseHeaders: [
              { header: 'Access-Control-Allow-Origin', operation: 'set', value: '*' },
              { header: 'Access-Control-Allow-Methods', operation: 'set', value: 'GET, POST, OPTIONS' },
              { header: 'Access-Control-Allow-Headers', operation: 'set', value: '*' }
            ]
          },
          condition: {
            urlFilter: '||wallhaven.cc',
            resourceTypes: ['xmlhttprequest', 'sub_frame']
          }
        }
      ]
    }).catch((err) => {
      console.warn('[Tabwai SW] DNR rule error:', err);
    });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  setupDNRRules();
});

setupDNRRules();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FETCH_WALLHAVEN' || request.type === 'FETCH_API') {
    const targetUrl = request.url;
    
    fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Wallhaven API responded with HTTP ${res.status}`);
        }
        const data = await res.json();
        sendResponse({ success: true, data });
      })
      .catch((err) => {
        console.error('[Tabwai SW] Fetch error:', err);
        sendResponse({ success: false, error: err.message });
      });

    return true; // Keep channel open for async response
  }
});
