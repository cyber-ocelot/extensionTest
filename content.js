// ══════════════════════════════════════════════════════
//  content.js  —  Content Script
//  Injected into every webpage (<all_urls> in manifest).
//  Has access to the page's DOM.
// ══════════════════════════════════════════════════════

// ── 1. GUARD: run once per page ───────────────────────
//if (!window.__myExtensionLoaded) {
  window.__myExtensionLoaded = true;
  init();
//}

function init() {
  console.log("[Extension] Content script running on:", window.location.hostname);

  // ── 1. AI STATUS ────────────────────────────────────
  const sites = ["gemini", "chatgpt", "claude"];
  const src = document.documentElement.outerHTML;
  const AIstatus = sites.some(term => src.includes(term)); // true or false

  // ── 2. LISTEN ───────────────────────────────────────
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    // init
    if (message.type === "GET_PAGE_INFO") {
      sendResponse({
        title: document.title,
        url: window.location.href,
        wordCount: document.body.innerText.split(/\s+/).length,
      });
    }

    // send AI status
    if (message.type === "AI_STATUS") {
      sendResponse ({
        AIstatus: AIstatus
      });
    }

    // flagged prompt
    if (message.type === "PROMPT_FLAGGED") {
      // show a warning on the page
      const banner = document.createElement("div");
      banner.textContent = "⚠️ Potential academic dishonesty detected. ~druid";
      banner.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0;
        background: #e53e3e; color: white;
        padding: 12px; text-align: center;
        font-size: 16px; z-index: 999999;
      `;
      document.body.appendChild(banner);
      setTimeout(() => banner.remove(), 5000); // disappears after 5 seconds
    }

    return true;
  });

  // ── 3. KEYBOARD STROKES ──────────────────────────────
  if (AIstatus) {
    let prompt = ""

    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        console.log("prompt sent:", prompt);
        handlePrompt(prompt);
        prompt = "";
      } else if (event.key === "Backspace") {
        prompt = prompt.slice(0, -1);
      } else if (event.key.length === 1) {
        prompt += event.key;
      }
    });
  }

  function handlePrompt(prompt) {
    console.log("handlePrompt running");
    chrome.runtime.sendMessage({
      type: "PROMPT_SENT",
      prompt: prompt,
      AIstatus: AIstatus,
      url: window.location.href
    });
  }

  // ── 3. YOUR PAGE LOGIC GOES HERE ────────────────────
  // Example: log all headings on the page
  // const headings = [...document.querySelectorAll("h1, h2, h3")];
  // console.log("[Extension] Headings found:", headings.map(h => h.textContent.trim()));
}
