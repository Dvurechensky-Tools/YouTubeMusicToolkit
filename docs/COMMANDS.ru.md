<div align="center" style="margin: 20px 0; padding: 10px; background: #1c1917; border-radius: 10px;">
  <strong>🌐 Язык: </strong>
  
  <span style="color: #F5F752; margin: 0 10px;">
    ✅ 🇷🇺 Русский (текущий)
  </span>
  | 
  <a href="./COMMANDS.md" style="color: #0891b2; margin: 0 10px;">
    🇺🇸 English
  </a>
</div>

- [На главную](../README.ru.md)

---

# Использование

- [Использование](#использование)
- [Команды `ytMSE`](#команды-ytmse)
  - [`ytMSE.list()`](#ytmselist)
  - [`ytMSE.inspect()`](#ytmseinspect)
  - [`ytMSE.inspect(id)`](#ytmseinspectid)
  - [`ytMSE.save()`](#ytmsesave)
  - [`ytMSE.save(id)`](#ytmsesaveid)
  - [`ytMSE.save(id, filename)`](#ytmsesaveid-filename)
  - [`ytMSE.clear()`](#ytmseclear)
  - [`ytMSE.getMeta()`](#ytmsegetmeta)
  - [`ytMSE.playerInfo()`](#ytmseplayerinfo)
- [Команды `ytAuto`](#команды-ytauto)
  - [`ytAuto.start()`](#ytautostart)
  - [`ytAuto.start(1500)`](#ytautostart1500)
  - [`ytAuto.stop()`](#ytautostop)
  - [`ytAuto.stop(false)`](#ytautostopfalse)
  - [`ytAuto.status()`](#ytautostatus)
  - [`ytAuto.saveNow()`](#ytautosavenow)
  - [`ytAuto.setMinBytes(bytes)`](#ytautosetminbytesbytes)

# Команды `ytMSE`

## `ytMSE.list()`

Показывает все собранные сессии.

```js
ytMSE.list()
```

Пример того, что вернётся:

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

Показывает **последнюю аудио-сессию** полностью.

```js
ytMSE.inspect()
```

---

## `ytMSE.inspect(id)`

Показывает конкретную сессию по ID.

```js
ytMSE.inspect(0)
```

---

## `ytMSE.save()`

Сохраняет **лучшую завершённую предыдущую** сессию, а если её нет — последнюю актуальную.

```js
ytMSE.save()
```

---

## `ytMSE.save(id)`

Сохраняет конкретную сессию по ID.

```js
ytMSE.save(0)
```

---

## `ytMSE.save(id, filename)`

Сохраняет конкретную сессию под своим именем файла.

```js
ytMSE.save(0, 'my_track.webm')
```

---

## `ytMSE.clear()`

Очищает все накопленные сессии и сбрасывает внутреннее состояние.

```js
ytMSE.clear()
```

---

## `ytMSE.getMeta()`

Возвращает текущую мету трека из player bar.

```js
ytMSE.getMeta()
```

Пример:

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

Возвращает техническую инфу по `<audio>`:

- `currentTime`
- `duration`
- `paused`
- `src`
- `buffered`

```js
ytMSE.playerInfo()
```

---

# Команды `ytAuto`

## `ytAuto.start()`

Запускает авто-режим с дефолтным интервалом.

```js
ytAuto.start()
```

---

## `ytAuto.start(1500)`

Запускает авто-режим с кастомным интервалом проверки.

```js
ytAuto.start(1500)
```

---

## `ytAuto.stop()`

Останавливает авто-режим и по умолчанию пытается сохранить последний кандидат.

```js
ytAuto.stop()
```

---

## `ytAuto.stop(false)`

Останавливает авто-режим **без финального сохранения**.

```js
ytAuto.stop(false)
```

---

## `ytAuto.status()`

Показывает текущее состояние авто-системы:

- работает ли авто-режим
- текущий stableKey
- pendingKey
- pendingCount
- minBytesToSave
- список сессий
- текущую мету

```js
ytAuto.status()
```

---

## `ytAuto.saveNow()`

Принудительно сохранить лучший доступный кандидат прямо сейчас.

```js
ytAuto.saveNow()
```

---

## `ytAuto.setMinBytes(bytes)`

Меняет минимальный размер сессии, при котором её можно сохранять.

```js
ytAuto.setMinBytes(300000)
```

Например:

```js
ytAuto.setMinBytes(500000)
```

---
