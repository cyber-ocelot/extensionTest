/*
 * GNU AFFERO GENERAL PUBLIC LICENSE
 *                        Version 3, 19 November 2007
 * 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  Everyone is permitted to copy and distribute verbatim copies
 *  of this license document, but changing it is not allowed.
 * 
 *                             Preamble
 * 
 *   The GNU Affero General Public License is a free, copyleft license for
 * software and other kinds of works, specifically designed to ensure
 * cooperation with the community in the case of network server software.
 * 
 *   The licenses for most software and other practical works are designed
 * to take away your freedom to share and change the works.  By contrast,
 * our General Public Licenses are intended to guarantee your freedom to
 * share and change all versions of a program--to make sure it remains free
 * software for all its users.
 * 
 *   When we speak of free software, we are referring to freedom, not
 * price.  Our General Public Licenses are designed to make sure that you
 * have the freedom to distribute copies of free software (and charge for
 * them if you wish), that you receive source code or can get it if you
 * want it, that you can change the software or use pieces of it in new
 * free programs, and that you know you can do these things.
 * 
 *   Developers that use our General Public Licenses protect your rights
 * with two steps: (1) assert copyright on the software, and (2) offer
 * you this License which gives you legal permission to copy, distribute
 * and/or modify the software.
 * 
 *   A secondary benefit of defending all users' freedom is that
 * improvements made in alternate versions of the program, if they
 * receive widespread use, become available for other developers to
 * incorporate.  Many developers of free software are heartened and
 * encouraged by the resulting cooperation.  However, in the case of
 * software used on network servers, this result may fail to come about.
 * The GNU General Public License permits making a modified version and
 * letting the public access it on a server without ever releasing its
 * source code to the public.
 * 
 *   The GNU Affero General Public License is designed specifically to
 * ensure that, in such cases, the modified source code becomes available
 * to the community.  It requires the operator of a network server to
 * provide the source code of the modified version running there to the
 * users of that server.  Therefore, public use of a modified version, on
 * a publicly accessible server, gives the public access to the source
 * code of the modified version.
 * 
 *   An older license, called the Affero General Public License and
 * published by Affero, was designed to accomplish similar goals.  This is
 * a different license, not a version of the Affero GPL, but Affero has
 * released a new version of the Affero GPL which permits relicensing under
 * this license.
 */

// ══════════════════════════════════════════════════════
//  background.js  —  Service Worker
//  Runs in the background even when the popup is closed.
// ══════════════════════════════════════════════════════

// ── Firebase Import(s) ────────────────────────────────
import { auth, db } from "./firebase.js";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";

// ── Install / Update ──────────────────────────────────
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("[Background] Installed for the first time.");
    // set any default storage values here:
    chrome.storage.sync.set({ exampleSetting: true });
    // API key storage
    //chrome.storage.local.set({geminiKey: "AIzaSyAIs5RV9NeBV7MBzQMcRyqCWxAHKbq0KxQ"})
  }
  if (details.reason === "update") {
    console.log("[Background] Updated to version", chrome.runtime.getManifest().version);
  }
});

// ── Message Listener ──────────────────────────────────
// listen for messages from popup.js or content.js
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("[Background] Message received:", message);

  // example: handle a "ping" message
  if (message.type === "ping") {
    sendResponse({ type: "pong", time: Date.now() });
  }

  // prompt handler
  if (message.type === "PROMPT_SENT") {
    console.log("[Background] received:", message.prompt);
    console.log("[Background] on AI site:", message.AIstatus);

    await analyzePrompt(message.prompt, message.AIstatus, sender.tab.id);
  }

  if (message.type === "IMAGE_UPLOADED") {
    console.log("[Background] Image uploaded:", message.filename);

    // send same banner as "PROMPT_FLAGGED"
    chrome.tabs.query ({ active: true, currentWindow: true }, (tabs) => {

      chrome.tabs.sendMessage(tabs[0].id, { type: "PROMPT_FLAGGED", data: "image" })
        .catch(() => console.log("[Background] Could not reach content script."));
      
    });

    // write to Firestore
    addFlag({
      event: "IMAGE_UPLOADED",
      prompt: message.filename ?? null,
      aiSite: message.AIstatus ?? null,
      timestamp: new Date().toISOString()
    });

    // increment tally in storage
    /*chrome.storage.local.get(["flagCount"], (result) => {
      console.log("[Background] Adding to flagCount.");
      const newCount = (result.flagCount || 0) + 1;
      chrome.storage.local.set({ flagCount: newCount });
    });*/
  };

  switch(message.type) {

    case "LOGIN":
      login();
      break;
    
    case "FLAG":
      addFlag(message);
      break;

  }

  return true; // keep message channel open for async responses
});

// ── Login Function ──────────────────────────────────────────────
async function login() {
  // get OAuth token
  try {
    const result = await chrome.identity.getAuthToken({
      interactive: true
    });

    console.log("[Background] Token:", result);

     // exchange for Firebase credential
    const credential = GoogleAuthProvider.credential(
      null,
      result.token
    );

    // sign in to Firebase
    const userCredential = await signInWithCredential(
      auth,
      credential
    );

    const user = userCredential.user;

    // create reference to user's document
    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        createdAt: new Date().toISOString()
      },
      { merge: true } // makes sure future logins don't overwrite
    );

    // console logs to track progress
    console.log("[Background] Signed in!");
    console.log("[Background] Current user:", userCredential.user);

  } catch (error) {
    console.error("[Background] Login error:", error);
  }
}

// ── Saving Flag Data in Firestore ───────────────────────────────────
async function addFlag(flagData) {
  
  // if no user logged in
  if (!auth.currentUser) {
    console.log("[Background] No user logged in.");
    return;
  }

  // error catch
  console.log("[Background] Current user:", auth.currentUser.uid);

  try {
    // saving user credentials
    const uid = auth.currentUser.uid;

    // today's date (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    // users/{uid}/dates/{today}
    const dayRef = doc(db, 'users', uid, 'dates', today);

    const daySnap = await getDoc(dayRef);

    if (!daySnap.exists()) {

      // first flag of the day
      await setDoc(dayRef, {
        //flagCount: 1,
        flags: [flagData]
      });

    } else {

      // add another flag
      await updateDoc(dayRef, {
        //flagCount: increment(1),
        flags: arrayUnion(flagData)
      });
      
    }
  } catch (error) {
    console.error("[Background] Firestore failed to save flag:", error);
  }

  console.log("[Background] Firestore saving:",flagData);
}

// ── Analyze AI Prompt ──────────────────────────────────
async function analyzePrompt(prompt, AIstatus, tabId) {
  console.log("[Background] analyzePrompt called with:", prompt);
  
  const cheatPhrases = [
    "give me the answer",
    "what is the answer",
    "solve this for me",
    "do my homework",
    "write my essay",
    "answer this question",
    "answer this",
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

  console.log("[Background] Prompt analyzed:", prompt);
  console.log("[Background] Flagged:", flagged);

  if (flagged) {
    
    // send banner to content.js
    if (tabId) {
      console.log("[Background] Sending PROMPT_FLAGGED to tab:", tabId);

      chrome.tabs.sendMessage(
        tabId, 
        { 
          type: "PROMPT_FLAGGED", 
          data: "text" 
        },
        () => {
          if (chrome.runtime.lastError) {
            console.log("[Background] Error:", chrome.runtime.lastError.message);
          }
        }
      );
        //.catch(() => console.log("[Background] Could not reach content script."));
    }

    // write to Firestore
    addFlag({
      event: "PROMPT_FLAGGED",
      prompt: prompt,
      aiSite: AIstatus,
      timestamp: new Date().toISOString()
    });

    // increment tally in storage
    /*chrome.storage.local.get(["flagCount"], (result) => {
      console.log("[Background] Adding to flagCount.");
      const newCount = (result.flagCount || 0) + 1;
      chrome.storage.local.set({ flagCount: newCount });
    });*/
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
