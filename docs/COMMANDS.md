<div align="center" style="margin: 20px 0; padding: 10px; background: #1c1917; border-radius: 10px;">
  <strong>🌐 Language: </strong>
  
  <a href="./COMMANDS.ru.md" style="color: #F5F752; margin: 0 10px;">
    🇷🇺 Russian
  </a>
  | 
  <span style="color: #0891b2; margin: 0 10px;">
    ✅ 🇺🇸 English (current)
  </span>
</div>

- [Back to main](../README.md)

---

# Usage

- [Usage](#usage)
- [Commands `ytMSE`](#commands-ytmse)
  - [`ytMSE.list()`](#ytmselist)
  - [`ytMSE.inspect()`](#ytmseinspect)
  - [`ytMSE.inspect(id)`](#ytmseinspectid)
  - [`ytMSE.save()`](#ytmsesave)
  - [`ytMSE.save(id)`](#ytmsesaveid)
  - [`ytMSE.save(id, filename)`](#ytmsesaveid-filename)
  - [`ytMSE.clear()`](#ytmseclear)
  - [`ytMSE.getMeta()`](#ytmsegetmeta)
  - [`ytMSE.playerInfo()`](#ytmseplayerinfo)
- [Commands `ytAuto`](#commands-ytauto)
  - [`ytAuto.start()`](#ytautostart)
  - [`ytAuto.start(1500)`](#ytautostart1500)
  - [`ytAuto.stop()`](#ytautostop)
  - [`ytAuto.stop(false)`](#ytautostopfalse)
  - [`ytAuto.status()`](#ytautostatus)
  - [`ytAuto.saveNow()`](#ytautosavenow)
  - [`ytAuto.setMinBytes(bytes)`](#ytautosetminbytesbytes)

# Commands `ytMSE`

## `ytMSE.list()`

Displays all collected sessions.

```js
ytMSE.list()
```

Example output:

```js
;[
	{
		id: 0,
		mime: 'audio/webm; codecs="opus"',
		totalBytes: 1423345,
		chunks: 38,
		createdAt: '2026-03-27T14:00:00.000Z',
		title: 'Track Name',
		artist: 'Artist Name',
		saved: false,
	},
]
```

---

## `ytMSE.inspect()`

Displays the **latest audio session** in full.

```js
ytMSE.inspect()
```

---

## `ytMSE.inspect(id)`

Displays a specific session by ID.

```js
ytMSE.inspect(0)
```

---

## `ytMSE.save()`

Saves the **best completed previous session**, or the latest one if none exists.

```js
ytMSE.save()
```

---

## `ytMSE.save(id)`

Saves a specific session by ID.

```js
ytMSE.save(0)
```

---

## `ytMSE.save(id, filename)`

Saves a specific session with a custom filename.

```js
ytMSE.save(0, 'my_track.webm')
```

---

## `ytMSE.clear()`

Clears all collected sessions and resets internal state.

```js
ytMSE.clear()
```

---

## `ytMSE.getMeta()`

Returns current track metadata from the player bar.

```js
ytMSE.getMeta()
```

Example:

```js
{
  title: "Track Name",
  artist: "Artist Name",
  src: "blob:https://music.youtube.com/...",
  currentTime: 31.42,
  duration: 215.19,
  paused: false
}
```

---

## `ytMSE.playerInfo()`

Returns technical `<audio>` info:

- `currentTime`
- `duration`
- `paused`
- `src`
- `buffered`

```js
ytMSE.playerInfo()
```

---

# Commands `ytAuto`

## `ytAuto.start()`

Starts auto mode with default interval.

```js
ytAuto.start()
```

---

## `ytAuto.start(1500)`

Starts auto mode with custom polling interval.

```js
ytAuto.start(1500)
```

---

## `ytAuto.stop()`

Stops auto mode and attempts to save the last candidate by default.

```js
ytAuto.stop()
```

---

## `ytAuto.stop(false)`

Stops auto mode **without final save**.

```js
ytAuto.stop(false)
```

---

## `ytAuto.status()`

Shows current auto-system state:

- whether auto mode is running
- current `stableKey`
- `pendingKey`
- `pendingCount`
- `minBytesToSave`
- session list
- current metadata

```js
ytAuto.status()
```

---

## `ytAuto.saveNow()`

Force-save the best available session immediately.

```js
ytAuto.saveNow()
```

---

## `ytAuto.setMinBytes(bytes)`

Sets minimum session size required for saving.

```js
ytAuto.setMinBytes(300000)
```

Example:

```js
ytAuto.setMinBytes(500000)
```

---
