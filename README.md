# My Chrome Extension

A clean, warm, educational Chrome extension framework — ready for you to customize.

## 📁 File Structure

```
extension/
├── manifest.json     ← Extension config (name, permissions, etc.)
├── popup.html        ← The UI shown when you click the extension icon
├── popup.css         ← All styles — edit colors/fonts here
├── popup.js          ← Popup logic — edit buttons & tips here
├── background.js     ← Background service worker (runs always)
├── content.js        ← Injected into web pages (DOM access)
└── icons/            ← Replace with your own 16×48×128px PNGs
```

## 🚀 Load in Chrome

1. Open Chrome → go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this `extension/` folder

The extension icon appears in your toolbar. Click it to open the popup.

## ✏️ Common Customizations

### Change the name & description
Edit `manifest.json` → `"name"` and `"description"` fields.

### Change colors & fonts
Edit the `:root` block at the top of `popup.css`.

### Add your own tips
Edit the `TIPS` array at the top of `popup.js`.

### Change what the main button does
Edit the `btnAction` click handler in `popup.js` (section 6).

### Read data from the current page
Send a message from `popup.js` to `content.js`:
```js
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_INFO" }, (response) => {
    console.log(response.title, response.wordCount);
  });
});
```

### Store user settings
```js
// Save
chrome.storage.sync.set({ myKey: "myValue" });

// Load
chrome.storage.sync.get(["myKey"], (result) => {
  console.log(result.myKey);
});
```

### Add more permissions
Edit the `"permissions"` array in `manifest.json`.  
Common ones: `"tabs"`, `"bookmarks"`, `"history"`, `"notifications"`.

## 🔄 Reloading After Changes

After editing files, go to `chrome://extensions` and click the **↺ reload** button on your extension card.
