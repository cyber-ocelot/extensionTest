# druid
As of 7/17/2026, a humble caterpillar hoping to metamorph into a magnificent butterfly.

## overall workflow
> [extension] --> [database] --> [website]

## extension
Like adding Grammarly, AdBlocker, or Google Translate to Chrome---the default browser of many---Druid can be uploaded as well (once completed to the full extent).

### file structure

```
druid/
├── extension/
  ├── src/
      ├── popup.js          ← Popup logic — edit buttons & tips here
      ├── popup_old.css     ← Backup version of popup.css
      ├── background.js     ← Background service worker (runs always)
      ├── content.js        ← Injected into web pages (DOM access)
      └── firebase.js
  ├── package-lock.json
  ├── package.json
  ├── .gitignore
  ├── vite.config.js
  ├── README.md
  └── public/  
      ├── popup.html        ← The UI shown when you click the extension icon
      ├── icons/            ← Icons
      ├── popup.css         ← All styles — edit colors/fonts here
      └── manifest.json     ← Extension config (name, permissions, etc.)
├── website/
  ├── public/
  ├── src/
    ├── assets/
    ├── App.css
    ├── App.jsx
    ├── Dashboard.jsx
    ├── firebase.js
    ├── index.css
    ├── Login.jsx
    └── main.jsx
  ├── eslint.config.js
  ├── index.html
  ├── package-lock.json
  ├── package.json
  ├── README.md
  └── vite.config.js
├── website-backup/
├── extension-backup/
├── images/
├── .gitignore
├── add_license.py
├── license_preamble.txt
├── LICENSE
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
└── README.md

```

### workflow
1) Once the extension is in your browser, it will check whether the website it runs on is actually AI or not. Otherwise, logic that should only run on AI sites will be running everywhere and that's not what this application is built for, nor is it efficient.

<p align="center">
  <img src="./images/extension/ai_detection.png" alt="AI detection" width="500" />
</p>

2) If Druid determines the website is not AI, it lets the user be. If it determines the site is AI, it falls into a loop of conditionals:
    - Whenever the user types a prompt, Druid is able to check whether or not the said prompt crosses the line of academic dishonesty or not. If the user is deemed to be crossing it, the "flag" count gets ticked up one.
    
    <p align="center">
    <img src="./images/extension/academic_dishonesty.png" alt="Academic dishonesty" width="500" />
    </p>

    - "Flags" get ticked up one whenever the user: types an academically dishonest prompt (as mentioned before), copies and pastes something into the input field, or uploads files to the chatbot.

    <p align="center">
    <img src="./images/extension/copy_paste.png" width="45%" /> <img src="./images/extension/image_upload.png" width="45%" />
    </p>

    - As the user will be signed in via the account they created on the website beforehand as part of the registration process, their data will be saved.
3) The "flag count" they got for the day as well as each prompt/action that triggered each flag will be saved in a secure database by Druid.

<p align="center">
  <img src="./images/extension/flag_count.png" alt="Flag count" width="500" />
</p>

4) ***WIP:*** Saved information--the flag count and the actions on the AI website that triggered the flags---will be pulled from the database to be displayed on the website when logged in with user's credentials.

## website interface
As of now, the Druid runs on a local server and is only accesible via `npm run dev` and other `npm` commands. Built with `React.js` on the `Vite` interface, this website acts as a homebase for everything Druid.
1) **The landing/home page;** the very first thing you see

<p align="center">
  <img src="./images/website/home.png" alt="Landing/home page" width="500" />
</p>

2) **The "features" page;** a list of Druid's substantial features

<p align="center">
  <img src="./images/website/features.png" alt="Features page" width="500" />
</p>

3) **The "how it works" page;** a breakdown of Druid's functions and how it works---essentially the "workflow" section of this `README.md` in short form

<p align="center">
  <img src="./images/website/how_it_works.png" alt="How it works page" width="500" />
</p>

4) Let's get started and sign up to experience Druid's magic!

<p align="center">
  <img src="./images/website/get_started.png" alt="Get started page" width="500" />
</p>

5) *P.S.:* you log in once, Druid remembers you forever---unless you delete your account, which no sane person would do after experiencing Druid.

<p align="center">
  <img src="./images/website/welcome_back.png" alt="Welcome back page" width="500" />
</p>


## the story - because every big thing has one
My extension is centered around the concept we've all been facing as of recently---with distrust, joy, or (more often that not) an angsty type of fear.  
November 30th, 2022. An all but disregarded date---nothing special about it except for the fact that it might have been included in Thanksgiving Break.  
Yet this was when the world shook.  
Fine, okay, maybe that's a bit too dramatic.  
On November 30th, 2022, OpenAI launched the generative chatbot we've all become so familiar with, whether you like it or not; ChatGPT. Within five days of its launch, the chatbot was racking up users by the millions, trending around the world---as per sources ranging from History.com to Google Trends.  
Of course the big tech daddies aren't just gonna sit back and watch a new upstart swallow up all the consumers. After ChatGPT, the conveyor belt of AI chatbots only picked up speed. It continously kept spewing out new releases.  
Gemini by Google---initially developed as Bard AI in 2024---came out stumbling on its own feet. Antropic released Claude, targeting the coders. Elon Musk released Grok because, well, he's Elon Musk.  
One by one, society blazed with a wildfire that could either set to flames everything in its path---or, in doing so, create fresh new land for future generations to pave forward on.  
Druid was a random thought that soon blossomed into a "eureka!" moment. If teachers were able to enforce the line drawn between AI usage and AI misusage, they would have one less headache to worry about. Students wouldn't have to guess and constantly question their actions---and innocent pupils wouldn't need to get blamed mistakenly.  
I'm willing to run the extra mile, go the whole nine yards, break new ground---because Druid is merely the tip of the iceberg that is  hanging on a thin thread between salvation and destruction; AI regulation.

> big ideas have small beginnings

## citing this project

If you use this product in a project or school assignment, please cite it as:
> Thuviksa Mathialakan, "Druid", GitHub Repository, 2026. Available at: https://github.com/cyber-ocelot/druid