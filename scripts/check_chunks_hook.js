;(() => {
	if (window.__ytSnifferInstalled) {
		console.warn('YT sniffer already installed')
		return
	}
	window.__ytSnifferInstalled = true

	console.log('[YT] videoplayback sniffer installed')

	const captured = []
	let requestCount = 0

	function saveBlob(parts, filename = 'youtube_music_dump.bin') {
		const blob = new Blob(parts, { type: 'application/octet-stream' })
		const a = document.createElement('a')
		a.href = URL.createObjectURL(blob)
		a.download = filename
		a.click()
		setTimeout(() => URL.revokeObjectURL(a.href), 5000)
	}

	function logChunk(source, url, buf) {
		const u = new URL(url)
		const range = u.searchParams.get('range')
		const itag = u.searchParams.get('itag')
		const clen = u.searchParams.get('clen')
		const mime = u.searchParams.get('mime')
		const idx = requestCount++

		const uint = new Uint8Array(buf)
		const previewText = new TextDecoder().decode(uint.slice(0, 64))

		const item = {
			idx,
			source,
			url,
			range,
			itag,
			clen,
			mime,
			size: uint.byteLength,
			previewText,
			bytes: uint,
		}

		captured.push(item)

		console.log(
			`[YT][${idx}] ${source} size=${item.size} range=${range} itag=${itag} mime=${mime}`,
			item,
		)
	}

	// ===== fetch hook =====
	const origFetch = window.fetch
	window.fetch = async function (...args) {
		const req = args[0]
		const url = typeof req === 'string' ? req : req.url

		const res = await origFetch.apply(this, args)

		try {
			if (url.includes('googlevideo.com/videoplayback')) {
				const clone = res.clone()
				const buf = await clone.arrayBuffer()
				logChunk('fetch', url, buf)
			}
		} catch (e) {
			console.error('[YT][fetch hook error]', e)
		}

		return res
	}

	// ===== XHR hook =====
	const origOpen = XMLHttpRequest.prototype.open
	const origSend = XMLHttpRequest.prototype.send

	XMLHttpRequest.prototype.open = function (method, url, ...rest) {
		this.__yt_url = url
		return origOpen.call(this, method, url, ...rest)
	}

	XMLHttpRequest.prototype.send = function (...args) {
		this.addEventListener('load', function () {
			try {
				if (
					this.__yt_url &&
					this.__yt_url.includes('googlevideo.com/videoplayback')
				) {
					if (this.response instanceof ArrayBuffer) {
						logChunk('xhr', this.__yt_url, this.response)
					} else if (typeof this.response === 'string') {
						const enc = new TextEncoder()
						logChunk('xhr', this.__yt_url, enc.encode(this.response).buffer)
					} else if (this.response) {
						console.warn('[YT][XHR] unknown response type', this.response)
					}
				}
			} catch (e) {
				console.error('[YT][xhr hook error]', e)
			}
		})

		return origSend.apply(this, args)
	}

	// ===== utility API =====
	window.ytDump = {
		list() {
			return captured.map(x => ({
				idx: x.idx,
				source: x.source,
				size: x.size,
				range: x.range,
				itag: x.itag,
				mime: x.mime,
				previewText: x.previewText,
			}))
		},

		raw() {
			return captured
		},

		clear() {
			captured.length = 0
			console.log('[YT] capture cleared')
		},

		saveAll(filename = 'youtube_music_dump.bin') {
			const ordered = [...captured].sort((a, b) => {
				const getStart = r => {
					if (!r) return Number.MAX_SAFE_INTEGER
					const m = r.match(/^(\d+)-/)
					return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER
				}
				return getStart(a.range) - getStart(b.range)
			})

			const parts = ordered.map(x => x.bytes)
			console.log(`[YT] saving ${parts.length} chunks`)
			saveBlob(parts, filename)
		},

		saveOne(idx, filename = null) {
			const item = captured.find(x => x.idx === idx)
			if (!item) {
				console.warn('No chunk with idx', idx)
				return
			}
			saveBlob([item.bytes], filename || `chunk_${idx}.bin`)
		},
	}

	console.log(`
[YT] Ready.
Commands:
ytDump.list()
ytDump.raw()
ytDump.clear()
ytDump.saveAll("track_dump.bin")
ytDump.saveOne(0)
    `)
})()
