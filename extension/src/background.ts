// Background service worker for Oculus extension
// Keeps the stream alive even when the popup is closed

let toolboxTabId: number | null = null;
let sessionId: string | null = null;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "START_BROADCAST") {
    sessionId = message.sessionId;
    // Open toolbox tab
    chrome.tabs.create(
      {
        url: chrome.runtime.getURL("toolbox.html"),
        active: true,
      },
      (tab) => {
        toolboxTabId = tab.id ?? null;
        sendResponse({ success: true, tabId: toolboxTabId });
      }
    );
    return true; // async response
  }

  if (message.type === "GET_SESSION") {
    sendResponse({ sessionId, toolboxTabId });
    return true;
  }

  if (message.type === "STOP_BROADCAST") {
    sessionId = null;
    if (toolboxTabId !== null) {
      chrome.tabs.remove(toolboxTabId).catch(() => {});
      toolboxTabId = null;
    }
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "FOCUS_TOOLBOX") {
    if (toolboxTabId !== null) {
      chrome.tabs.update(toolboxTabId, { active: true });
    }
    sendResponse({ success: true });
    return true;
  }
});

// Clean up if toolbox tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === toolboxTabId) {
    toolboxTabId = null;
    sessionId = null;
  }
});
