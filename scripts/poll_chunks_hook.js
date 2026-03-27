;(() => {
	// =========================================================
	// GUARD
	// =========================================================
	if (window.__ytToolkitInstalledV3) {
		console.warn('[YT] toolkit already installed')
		return
	}
	window.__ytToolkitInstalledV3 = true

	console.log('[YT] Installing clean MSE toolkit v3...')

	// =========================================================
	// STATE
	// =========================================================
	const sessions = []

	let autoRunning = false
	let autoTimer = null
	let autoStableKey = null
	let autoPendingKey = null
	let autoPendingCount = 0
	let autoLastSavedFingerprint = null
	let autoMinBytesToSave = 300000
	let autoIntervalMs = 1500
	const AUTO_REQUIRED_STABLE_TICKS = 3

	// =========================================================
	// HELPERS
	// =========================================================
	function sanitize(name) {
		return (name || 'track')
			.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
			.replace(/\s+/g, ' ')
			.trim()
	}

	function getAudioEl() {
		return document.querySelector('audio')
	}

	function cleanupText(s) {
		return (s || '')
			.replace(/\s+/g, ' ')
			.replace(/[\n\r\t]+/g, ' ')
			.trim()
	}

	function cleanPlayerTitle(s) {
		s = cleanupText(s)
		s = s.replace(/\s+-\s+YouTube Music$/i, '').trim()
		return s || 'track'
	}

	function cleanPlayerArtist(s) {
		s = cleanupText(s)
		return s
	}

	function getMeta() {
		const audio = getAudioEl()

		// Только player bar, без SEO/просмотров/лайков
		const title =
			cleanPlayerTitle(
				document.querySelector('ytmusic-player-bar .title')?.textContent ||
					document.querySelector('ytmusic-player-bar yt-formatted-string.title')
						?.textContent ||
					'',
			) || 'track'

		const artist =
			cleanPlayerArtist(
				document.querySelector('ytmusic-player-bar .byline a')?.textContent ||
					document.querySelector(
						'ytmusic-player-bar yt-formatted-string.byline a',
					)?.textContent ||
					document.querySelector('ytmusic-player-bar .byline')?.textContent ||
					document.querySelector(
						'ytmusic-player-bar yt-formatted-string.byline',
					)?.textContent ||
					'',
			) || ''

		return {
			title,
			artist,
			src: audio?.currentSrc || '',
			currentTime: audio?.currentTime || 0,
			duration: audio?.duration || 0,
			paused: audio?.paused ?? true,
		}
	}

	function makeTrackKey(meta) {
		return `${meta.artist}__${meta.title}__${meta.src}`
	}

	function makeFilename(meta, mime = 'audio/webm') {
		const ext = mime.includes('mp4') ? 'mp4' : 'webm'
		return (
			sanitize(`${meta.artist ? meta.artist + ' - ' : ''}${meta.title}`) +
			`.${ext}`
		)
	}

	function saveBlob(parts, mime, filename) {
		const blob = new Blob(parts, { type: mime || 'audio/webm' })
		const a = document.createElement('a')
		a.href = URL.createObjectURL(blob)
		a.download = filename || 'yt_dump.webm'
		a.click()
		setTimeout(() => URL.revokeObjectURL(a.href), 5000)
	}

	function getAllAudioSessions() {
		return sessions.filter(s => s.mime?.includes('audio'))
	}

	function getNewestAudioSession() {
		const audioSessions = getAllAudioSessions()
		if (!audioSessions.length) return null
		return [...audioSessions].sort((a, b) => b.id - a.id)[0]
	}

	function getBestCompletedPreviousSession() {
		const audioSessions = getAllAudioSessions().sort((a, b) => a.id - b.id)
		if (audioSessions.length < 2) return null

		const newest = audioSessions[audioSessions.length - 1]
		const older = audioSessions.filter(s => s.id !== newest.id)

		const candidates = older.filter(s => s.totalBytes >= autoMinBytesToSave)
		if (!candidates.length) return null

		return [...candidates].sort((a, b) => b.totalBytes - a.totalBytes)[0]
	}

	function pruneSessionsKeepNewestAudio() {
		const newest = getNewestAudioSession()
		sessions.length = 0
		if (newest) sessions.push(newest)
	}

	function saveSessionObject(session, reason = 'manual') {
		if (!session) {
			console.warn(`[YT][AUTO] no session to save (${reason})`)
			return false
		}

		if (!session.mime?.includes('audio')) {
			console.warn(`[YT][AUTO] skip non-audio session (${reason})`)
			return false
		}

		if (session.totalBytes < autoMinBytesToSave) {
			console.warn(
				`[YT][AUTO] skip save (${reason}), too small: ${session.totalBytes}`,
			)
			return false
		}

		// Имя только из замороженной meta сессии
		const meta = session.createdMeta || { title: 'track', artist: '' }
		const filename = makeFilename(meta, session.mime)
		const fingerprint = `${filename}__${session.totalBytes}__${session.id}`

		if (fingerprint === autoLastSavedFingerprint) {
			console.warn('[YT][AUTO] already saved same session')
			return false
		}

		console.log(
			`[YT][AUTO] SAVING (${reason}) => ${filename} | bytes=${session.totalBytes} | session=#${session.id}`,
		)

		saveBlob(session.chunks, session.mime, filename)
		autoLastSavedFingerprint = fingerprint
		session.saved = true
		return true
	}

	// =========================================================
	// MSE HOOK
	// =========================================================
	const origAddSourceBuffer = MediaSource.prototype.addSourceBuffer

	MediaSource.prototype.addSourceBuffer = function (mimeType) {
		const sb = origAddSourceBuffer.call(this, mimeType)

		const frozenMeta = getMeta()
		const session = {
			id: sessions.length ? Math.max(...sessions.map(s => s.id)) + 1 : 0,
			mime: mimeType,
			createdAt: new Date().toISOString(),
			createdMeta: frozenMeta,
			createdTrackKey: makeTrackKey(frozenMeta),
			chunks: [],
			totalBytes: 0,
			saved: false,
		}

		sessions.push(session)

		console.log(`[YT][MSE] New session #${session.id}`, {
			id: session.id,
			mime: session.mime,
			createdAt: session.createdAt,
			meta: session.createdMeta,
		})

		const origAppendBuffer = sb.appendBuffer

		sb.appendBuffer = function (buffer) {
			try {
				let u8 = null

				if (buffer instanceof ArrayBuffer) {
					u8 = new Uint8Array(buffer.slice(0))
				} else if (ArrayBuffer.isView(buffer)) {
					u8 = new Uint8Array(
						buffer.buffer.slice(
							buffer.byteOffset,
							buffer.byteOffset + buffer.byteLength,
						),
					)
				}

				if (u8 && u8.byteLength > 0) {
					session.chunks.push(u8)
					session.totalBytes += u8.byteLength

					console.log(
						`[YT][MSE][#${session.id}] appendBuffer ${u8.byteLength} bytes (total=${session.totalBytes})`,
					)
				}
			} catch (e) {
				console.error('[YT][MSE] appendBuffer hook error', e)
			}

			return origAppendBuffer.call(this, buffer)
		}

		return sb
	}

	// =========================================================
	// PUBLIC ytMSE
	// =========================================================
	window.ytMSE = {
		list() {
			return sessions.map(s => ({
				id: s.id,
				mime: s.mime,
				totalBytes: s.totalBytes,
				chunks: s.chunks.length,
				createdAt: s.createdAt,
				title: s.createdMeta?.title || '',
				artist: s.createdMeta?.artist || '',
				saved: !!s.saved,
			}))
		},

		inspect(id = null) {
			let s
			if (id == null) {
				s = getNewestAudioSession() || sessions[sessions.length - 1] || null
			} else {
				s = sessions.find(x => x.id === id) || null
			}

			if (!s) {
				console.warn('[YT][MSE] Session not found')
				return null
			}

			console.log(s)
			return s
		},

		clear() {
			sessions.length = 0
			autoStableKey = null
			autoPendingKey = null
			autoPendingCount = 0
			console.log('[YT][MSE] cleared')
		},

		save(id = null, filename = null) {
			const s =
				id == null
					? getBestCompletedPreviousSession() || getNewestAudioSession()
					: sessions.find(x => x.id === id)

			if (!s) {
				console.warn('[YT][MSE] Session not found')
				return false
			}

			if (filename) {
				console.log(`[YT][MSE] Saving session #${s.id} as ${filename}`)
				saveBlob(s.chunks, s.mime, filename)
				s.saved = true
				return true
			}

			return saveSessionObject(s, 'manual')
		},

		getMeta() {
			return getMeta()
		},

		playerInfo() {
			const audio = getAudioEl()
			if (!audio) {
				console.warn('[YT][MSE] No <audio> element found')
				return null
			}

			const ranges = []
			for (let i = 0; i < audio.buffered.length; i++) {
				ranges.push({
					start: audio.buffered.start(i),
					end: audio.buffered.end(i),
				})
			}

			return {
				currentTime: audio.currentTime,
				duration: audio.duration,
				paused: audio.paused,
				src: audio.currentSrc,
				buffered: ranges,
			}
		},
	}

	// =========================================================
	// AUTO RECORDER
	// =========================================================
	function autoTick() {
		if (!autoRunning) return

		const meta = getMeta()
		const key = makeTrackKey(meta)
		const newestAudio = getNewestAudioSession()

		if (!newestAudio) return

		if (!autoStableKey) {
			autoStableKey = key
			autoPendingKey = null
			autoPendingCount = 0
			console.log('[YT][AUTO] init stable track:', meta)
			return
		}

		if (key === autoStableKey) {
			autoPendingKey = null
			autoPendingCount = 0
			return
		}

		if (autoPendingKey !== key) {
			autoPendingKey = key
			autoPendingCount = 1
			console.log('[YT][AUTO] pending track change:', meta)
			return
		}

		autoPendingCount++

		if (autoPendingCount < AUTO_REQUIRED_STABLE_TICKS) {
			console.log(
				`[YT][AUTO] pending confirm ${autoPendingCount}/${AUTO_REQUIRED_STABLE_TICKS}`,
			)
			return
		}

		console.log('[YT][AUTO] TRACK CHANGE CONFIRMED')

		// Главное правило:
		// сохраняем не самый новый трек, а самую большую старую аудио-сессию
		const candidate = getBestCompletedPreviousSession()

		if (candidate) {
			saveSessionObject(candidate, 'track-change')
		} else {
			console.warn('[YT][AUTO] no completed previous session to save')
		}

		// После смены оставляем только самый новый буфер,
		// чтобы следующий трек продолжал писаться
		pruneSessionsKeepNewestAudio()

		autoStableKey = key
		autoPendingKey = null
		autoPendingCount = 0

		console.log('[YT][AUTO] state reset for next track')
	}

	window.ytAuto = {
		start(intervalMs = 1500) {
			if (autoRunning) {
				console.warn('[YT][AUTO] already running')
				return
			}

			autoRunning = true
			autoIntervalMs = intervalMs
			autoStableKey = null
			autoPendingKey = null
			autoPendingCount = 0
			autoLastSavedFingerprint = null

			autoTimer = setInterval(autoTick, autoIntervalMs)
			console.log(
				`[YT][AUTO] started (interval=${autoIntervalMs}ms, minBytes=${autoMinBytesToSave})`,
			)
		},

		stop(saveLast = true) {
			if (!autoRunning) {
				console.warn('[YT][AUTO] not running')
				return
			}

			clearInterval(autoTimer)
			autoTimer = null
			autoRunning = false

			if (saveLast) {
				const candidate =
					getBestCompletedPreviousSession() || getNewestAudioSession()
				if (candidate) {
					saveSessionObject(candidate, 'stop')
				}
			}

			console.log('[YT][AUTO] stopped')
		},

		status() {
			return {
				running: autoRunning,
				stableKey: autoStableKey,
				pendingKey: autoPendingKey,
				pendingCount: autoPendingCount,
				minBytesToSave: autoMinBytesToSave,
				sessions: window.ytMSE.list(),
				meta: getMeta(),
			}
		},

		saveNow() {
			const candidate =
				getBestCompletedPreviousSession() || getNewestAudioSession()
			return saveSessionObject(candidate, 'manual')
		},

		setMinBytes(bytes) {
			autoMinBytesToSave = bytes
			console.log('[YT][AUTO] minBytesToSave =', autoMinBytesToSave)
		},
	}

	console.log(`
[YT] Clean toolkit v3 installed.

Commands:
ytMSE.list()
ytMSE.inspect()
ytMSE.save()
ytMSE.clear()
ytMSE.playerInfo()

ytAuto.start()
ytAuto.stop()
ytAuto.status()
ytAuto.saveNow()
ytAuto.setMinBytes(300000)
	`)
})()
