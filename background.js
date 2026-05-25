// ══════════════════════════════════════════════════════
//  background.js  —  Service Worker
//  Runs in the background even when the popup is closed.
// ══════════════════════════════════════════════════════

// ── Install / Update ──────────────────────────────────
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("[Extension] Installed for the first time.");
    // Set any default storage values here:
    chrome.storage.sync.set({ exampleSetting: true });
    // API key storage
    //chrome.storage.local.set({geminiKey: "AIzaSyAIs5RV9NeBV7MBzQMcRyqCWxAHKbq0KxQ"})
  }
  if (details.reason === "update") {
    console.log("[Extension] Updated to version", chrome.runtime.getManifest().version);
  }
});

// ── Message Listener ──────────────────────────────────
// Listen for messages from popup.js or content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Background] Message received:", message);

  // Example: handle a "ping" message
  if (message.type === "ping") {
    sendResponse({ type: "pong", time: Date.now() });
  }

  // Prompt handler
  if (message.type === "PROMPT_SENT") {
    console.log("[Background] received:", message.prompt);
    console.log("[Background] on AI site:", message.AIstatus);

    analyzePrompt(message.prompt, message.AIstatus);
  }

  return true; // Keep message channel open for async responses
});

// ── Analyze AI Prompt ──────────────────────────────────
function analyzePrompt(prompt, AIstatus) {
  const cheatPhrases = [
    "give me the answer",
    "what is the answer",
    "solve this for me",
    "do my homework",
    "write my essay",
    "answer this question",
    "what's the answer",
    "tell me the answer",
    "just give me",
    "do this for me",
    "complete this for me",
    "finish this for me",
  ];

  const flagged = cheatPhrases.some(p => 
    prompt.toLowerCase().includes(p)
  );

  console.log("[Extension] Prompt analyzed:", prompt);
  console.log("[Extension] Flagged:", flagged);

  if (flagged) {
    // Send banner to content.js
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: "PROMPT_FLAGGED" })
        .catch(() => console.log("Could not reach content script."));
    });

    // Increment tally in storage
    chrome.storage.local.get(["flagCount"], (result) => {
      const newCount = (result.flagCount || 0) + 1;
      chrome.storage.local.set({ flagCount: newCount });
    });
  }

  return flagged;

}

// ── Tab Events (optional) ─────────────────────────────
// Uncomment to react when the user switches tabs:
// chrome.tabs.onActivated.addListener((activeInfo) => {
//   chrome.tabs.get(activeInfo.tabId, (tab) => {
//     console.log("[Background] Active tab:", tab.url);
//   });
// });
