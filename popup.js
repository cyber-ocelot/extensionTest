// ══════════════════════════════════════════════════════
//  popup.js  —  Edit this file to add your own logic
// ══════════════════════════════════════════════════════

// ── 1. TIPS  ─────────────────────────────────────────
// Add your own tip strings to this array!
const TIPS = [
  "You can edit popup.js to add your own tips and features.",
  "Use chrome.storage.sync to save settings across devices.",
  "Content scripts can read & modify any page you visit.",
  "The background service worker runs even when the popup is closed.",
];

// ── 2. DOM REFERENCES ────────────────────────────────
const urlEl      = document.getElementById("current-url");
const flagsEl    = document.getElementById("flagsEl");
const btnAction  = document.getElementById("btn-action");
const btnSettings = document.getElementById("btn-settings");
const output     = document.getElementById("output");
const outputText = document.getElementById("output-text");
const footerLink = document.getElementById("footer-link");

// ── 3. INIT ───────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadCurrentTab();
});

// ── 5. SHOW CURRENT TAB URL ───────────────────────────
function loadCurrentTab() {

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.url) {
      try {

        const url = new URL(tabs[0].url);
        urlEl.textContent = url.hostname || tabs[0].url; // current site
        const activeTabId = tabs[0].id;

        chrome.tabs.sendMessage(activeTabId, {type: "AI_STATUS"}, (response) => {
          if (chrome.runtime.lastError) { // send msg to content.js
            urlEl.textContent += "; N/A (no script)";
            return;
          }
          if (response?.AIstatus) { // content.js check if AI or not
          urlEl.textContent += "; AI"; // edits based on response
          } else {
            urlEl.textContent += "; reg";
          }
        });

        chrome.storage.local.get(["flagCount"], (result) => {
          const count = result.flagCount || 0;
          flagsEl.textContent = `⚠️ Flags detected: ${count}`;
          flagsEl.hidden = false;
        });

      } catch {
        urlEl.textContent = tabs[0].url;
      }

   } else {
      urlEl.textContent = "No active tab; N/A";
   }
  });
}

// ── 6. LISTEN ─────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {});

// ── 7. PRIMARY ACTION ─────────────────────────────────
// Replace this with whatever your extension actually does!
btnAction.addEventListener("click", () => {
  showOutput("✅ Action complete! Replace this handler in popup.js with your own logic.");
});

// ── 8. SETTINGS BUTTON ────────────────────────────────
// Opens a dedicated options page (you can add options.html later)
btnSettings.addEventListener("click", () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    showOutput("No settings page yet — create options.html to add one.");
  }
});

// ── 9. FOOTER LINK ────────────────────────────────────
footerLink.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "https://example.com" }); // ← change this URL
});

// ── 10. HELPERS ────────────────────────────────────────
function showOutput(message) {
  outputText.textContent = message;
  output.hidden = false;
}

function hideOutput() {
  output.hidden = true;
}
