<h1 align="center">Mon Mega Hub — Chrome Extension</h1>

<p align="center">
  <b>Bring Mon Mega Hub directly into your browser.</b><br/>
  Enhance your Google searches with movie, series & anime recommendations — powered by Mon Mega Hub.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Chrome-Extension-yellow?style=flat-square&logo=googlechrome" />
  <img src="https://img.shields.io/badge/Version-1.0-green?style=flat-square" />
</p>

---

## 🌟 What does it do?

**Mon Mega Hub Extension** seamlessly integrates the Mon Mega Hub platform into your daily browsing:

- 🔍 **Google Search integration** — A button appears directly on Google search results, letting you instantly add movies, series, or anime to your watchlist, compare titles, or find similar content.
- 🔔 **iOS-style notifications** — Get elegant, non-intrusive notifications inspired by Apple's design language.
- 🔐 **Stays logged in** — Your session is automatically synced with the Mon Mega Hub website. No need to log in twice.
- 🎨 **Seamless design** — The extension blends Mon Mega Hub's visual style with a clean, modern iOS-inspired UI.

---

## 🚀 Installation

> **Requirements:** Google Chrome (or any Chromium-based browser)

1. **Download** this repository (ZIP or `git clone`)
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **"Load unpacked"**
5. Select the `Extension/` folder
6. The extension icon will appear in your toolbar ✅

---

## 📁 Project Structure

```
Extension/
├── assets/          # Extension icons
├── popup/
│   ├── popup.html   # Popup UI
│   ├── popup.css    # Popup styles
│   └── popup.js     # Popup logic
├── background.js    # Service worker (auth sync, notifications)
├── content.js       # Injected script on Google Search
├── content.css      # Injected styles on Google Search
└── manifest.json    # Extension configuration (Manifest V3)
```

---

## 🔗 Related

- 🌐 **Website:** [mon-mega-hub.vercel.app](https://mon-mega-hub.vercel.app)

---

## 📄 License

This project is proprietary. All rights reserved — © Mon Mega Hub.
