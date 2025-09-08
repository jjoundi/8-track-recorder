// Minimal audio engine scaffold focused on structure.
// This is NOT production-ready; it's a starting point you can extend per the roadmap.
let ctx
let input
let masterGain
let tracks = []
let recMedia
let isPlaying = false
let isRecording = false
let startTime = 0
let metronomeEnabled = true
let tempo = 100

const TRACK_COUNT = 8

class Track {
  constructor(index) {
    this.index = index
    this.buffer = null       // Recorded audio as AudioBuffer
    this.gainNode = null
    this.panNode = null
    this.muted = false
    this.solo = false
    this.source = null       // Active playback node
    this.recorder = null
    this.chunks = []         // Float32 chunks during recording (simplified)
  }
}

export async function init() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  input = ctx.createMediaStreamSource(stream)

  masterGain = ctx.createGain()
  masterGain.gain.value = 1.0
  masterGain.connect(ctx.destination)

  // create 8 tracks
  tracks = Array.from({length: TRACK_COUNT}, (_, i) => {
    const t = new Track(i)
    t.panNode = new StereoPannerNode(ctx, { pan: 0 })
    t.gainNode = new GainNode(ctx, { gain: 0.9 })
    t.panNode.connect(t.gainNode).connect(masterGain)
    return t
  })
}

export function setTempo(bpm) { tempo = bpm }
export function setMetronomeEnabled(enabled) { metronomeEnabled = enabled }

export function setPan(i, value) { tracks[i]?.panNode && (tracks[i].panNode.pan.value = value) }
export function setGain(i, value) { tracks[i]?.gainNode && (tracks[i].gainNode.gain.value = value) }
export function setMute(i, flag) { if (tracks[i]) tracks[i].muted = flag }
export function setSolo(i, flag) { if (tracks[i]) tracks[i].solo = flag }

function audible(i) {
  const anySolo = tracks.some(t => t.solo)
  if (anySolo) return tracks[i].solo && !tracks[i].muted
  return !tracks[i].muted
}

function schedulePlayback() {
  // Very simplified scheduling: create a source per track and start together.
  const now = ctx.currentTime + 0.05
  startTime = now
  tracks.forEach((t, i) => {
    if (!t.buffer || !audible(i)) return
    const src = ctx.createBufferSource()
    src.buffer = t.buffer
    src.connect(t.panNode)
    src.start(now)
    t.source = src
  })
}

export async function play() {
  if (!ctx) await init()
  if (isPlaying) return
  isPlaying = true
  schedulePlayback()
}

export async function stop() {
  isPlaying = false
  tracks.forEach(t => { try { t.source && t.source.stop() } catch(e){} t.source = null })
}

// Super-simplified recorder that monitors input and records into a single armed track at a time.
export async function record(armedIndices) {
  if (!ctx) await init()
  if (isRecording) return
  isRecording = true

  // Start playback for overdub monitoring
  if (!isPlaying) await play()

  const recDest = ctx.createMediaStreamDestination()
  const monitorGain = ctx.createGain()
  monitorGain.gain.value = 1.0
  input.connect(monitorGain).connect(recDest)

  const mediaRecorder = new MediaRecorder(recDest.stream)
  const blobs = []
  mediaRecorder.ondataavailable = e => { if (e.data.size) blobs.push(e.data) }
  mediaRecorder.start(100)

  recMedia = { mediaRecorder, blobs, armedIndices }
}

export async function stopRecord() {
  if (!recMedia) return
  recMedia.mediaRecorder.stop()
  await new Promise(res => setTimeout(res, 50))

  const blob = new Blob(recMedia.blobs, { type: 'audio/webm' })
  const arrayBuf = await blob.arrayBuffer()
  const audioBuf = await ctx.decodeAudioData(arrayBuf)

  // Assign to the first armed track (for now)
  const idx = recMedia.armedIndices[0] ?? 0
  if (tracks[idx]) {
    tracks[idx].buffer = audioBuf
  }
  recMedia = null
  isRecording = false
}

export async function exportMixdown() {
  // Placeholder: realtime capture is browser/codecs dependent. Prefer OfflineAudioContext per roadmap.
  alert('WAV mixdown via OfflineAudioContext will be added later.')
}

export function clearAll() {
  tracks.forEach(t => { t.buffer = null })
}
