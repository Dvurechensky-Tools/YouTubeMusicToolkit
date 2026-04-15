<h1 align="center">YouTube Music MSE Audio Dumper Toolkit (Chrome DevTools)</h1>

<p align="center">
  <img src="https://shields.dvurechensky.pro/badge/Chrome-DevTools-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" />
  <img src="https://shields.dvurechensky.pro/badge/Target-YouTube%20Music-red?style=for-the-badge&logo=youtube&logoColor=white" />
  <img src="https://shields.dvurechensky.pro/badge/Tech-MSE%20%2F%20SourceBuffer-orange?style=for-the-badge" />
  <img src="https://shields.dvurechensky.pro/badge/Mode-Runtime%20Hook-black?style=for-the-badge" />
  <img src="https://shields.dvurechensky.pro/badge/Status-Experimental-yellow?style=for-the-badge" />
</p>

<div align="center" style="margin: 20px 0; padding: 10px; background: #1c1917; border-radius: 10px;">
  <strong>🌐 Language: </strong>
  
  <a href="./README.ru.md" style="color: #F5F752; margin: 0 10px;">
    🇷🇺 Russian
  </a>
  | 
  <span style="color: #0891b2; margin: 0 10px;">
    ✅ 🇺🇸 English (current)
  </span>
</div>

---

> A minimalist DevTools toolkit for intercepting audio chunks from **YouTube Music** via **MediaSource / SourceBuffer**, inspecting active sessions, auto-saving tracks on switch, and debugging the current player.

---

> [!WARNING]
> This toolkit works via **browser runtime hooks** and depends on the current implementation of **YouTube Music**.  
> If Google changes the DOM, MSE pipeline, player structure, or buffering logic — parts of the code may require updates.

> [!NOTE]
> This is not an extension or standalone application.  
> The toolkit runs **directly inside Chrome DevTools Console** and works **within the current YouTube Music tab**.

> [!IMPORTANT]
> This tool is designed as a **technical DevTools toolkit for analysis and research**, not as a polished one-click end-user product.

---

- [What this toolkit can do](#what-this-toolkit-can-do)
  - [Core features](#core-features)
    - [1) Intercepting MSE audio stream](#1-intercepting-mse-audio-stream)
    - [2) Automatic session creation](#2-automatic-session-creation)
    - [3) Clean track metadata extraction](#3-clean-track-metadata-extraction)
    - [4) Manual audio saving](#4-manual-audio-saving)
    - [5) Auto-save on track switch](#5-auto-save-on-track-switch)
    - [6) Inspection and debugging](#6-inspection-and-debugging)
- [How it works](#how-it-works)
  - [Architecture](#architecture)
    - [Hooking `MediaSource.addSourceBuffer`](#hooking-mediasourceaddsourcebuffer)
    - [Hooking `SourceBuffer.appendBuffer`](#hooking-sourcebufferappendbuffer)
    - [Track change logic](#track-change-logic)
- [Installation / launch](#installation--launch)
  - [Option: via Chrome DevTools](#option-via-chrome-devtools)
- [Typical usage scenarios](#typical-usage-scenarios)
- [Why this is useful](#why-this-is-useful)
- [Limitations](#limitations)
- [Dev Notes](#dev-notes)
- [Troubleshooting](#troubleshooting)
- [Future ideas](#future-ideas)
- [Quick start](#quick-start)
- [Disclaimer](#disclaimer)

---

## Why I built this

I wanted **direct technical control** over what actually arrives in the browser when playing music on **YouTube Music**.

Not through extensions, not through sketchy downloaders, not via MITM tricks — but **inside the tab itself**, at the level of how the site feeds audio into `<audio>` via **MSE (Media Source Extensions)**.

The idea was simple:

- hook into `MediaSource.prototype.addSourceBuffer`
- intercept `appendBuffer()`
- collect all audio chunks
- bind them to a track
- and optionally **save them as a file**

The result is a **clean DevTools toolkit** that you can paste into Chrome DevTools Console and immediately use.

---

# What this toolkit can do

## Core features

### 1) Intercepting MSE audio stream

Hooks:

- `MediaSource.prototype.addSourceBuffer`
- `SourceBuffer.appendBuffer()`

Collects all audio chunks fed into the player.

---

### 2) Automatic session creation

Each `SourceBuffer` creates a session:

- `id`
- `mime`
- `createdAt`
- frozen `meta`
- `chunks`
- `totalBytes`
- `saved`

---

### 3) Clean track metadata extraction

Extracts:

- title
- artist
- currentSrc
- currentTime
- duration
- paused

Avoids:

- SEO garbage
- likes/views
- noisy byline data

---

### 4) Manual audio saving

You can save:

- latest session
- previous session
- specific session by ID

---

### 5) Auto-save on track switch

`ytAuto`:

- tracks current song
- detects real track changes
- ignores DOM flicker
- confirms stable change
- saves previous session

---

### 6) Inspection and debugging

Inspect:

- sessions
- buffers
- player state
- metadata

---

# How it works

## Architecture

### Hooking `MediaSource.addSourceBuffer`

- call original
- create session
- freeze meta
- patch appendBuffer

---

### Hooking `SourceBuffer.appendBuffer`

- copy buffer
- push into session
- increase total size

---

### Track change logic

Uses stable key detection to avoid false triggers.

---

# Installation / launch

## Option: via Chrome DevTools

1. Open https://music.youtube.com
2. Press F12
3. Go to Console
4. Paste toolkit code

Expected output:

```

[YT] Clean toolkit v3 installed.

```

---

# Typical usage scenarios

Manual:

```js
ytMSE.list()
ytMSE.inspect()
ytMSE.save()
```

Auto:

```js
ytAuto.start()
ytAuto.stop()
```

Debug:

```js
ytMSE.getMeta()
ytMSE.playerInfo()
ytAuto.status()
```

---

# Why this is useful

- No MITM
- Works at player level
- No dependencies
- Great for research/debugging

---

# Limitations

- Depends on YouTube implementation
- Possible duplicate sessions
- Not a polished UI tool

---

# Dev Notes

- Meta frozen at session creation
- Saves best previous session
- No UI by design

---

# Troubleshooting

Common issues:

- no install message → check script
- empty sessions → wait buffering
- corrupted files → increase threshold

---

# Future ideas

- better filtering
- UI panel
- JSON export
- full track detection
- Chrome extension wrapper

---

# Quick start

```js
ytAuto.start()
```

Stop:

```js
ytAuto.stop()
```

---

# Disclaimer

> [!CAUTION]
> This project is a **technical research toolkit** for studying MSE, SourceBuffer, and browser media pipelines.
>
> Use at your own risk.
