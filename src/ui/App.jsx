import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as engine from '../audio/engine.js'

const TRACK_COUNT = 8

export default function App() {
  const [ready, setReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [armed, setArmed] = useState(new Set())
  const [tempo, setTempo] = useState(100)
  const [metronome, setMetronome] = useState(true)
  const [pan, setPan] = useState(Array.from({length: TRACK_COUNT}, () => 0))
  const [gain, setGain] = useState(Array.from({length: TRACK_COUNT}, () => 0.9))
  const [mute, setMute] = useState(Array.from({length: TRACK_COUNT}, () => false))
  const [solo, setSolo] = useState(Array.from({length: TRACK_COUNT}, () => false))

  useEffect(() => {
    engine.init().then(() => setReady(true)).catch(console.error)
  }, [])

  useEffect(() => { engine.setTempo(tempo) }, [tempo])
  useEffect(() => { engine.setMetronomeEnabled(metronome) }, [metronome])

  useEffect(() => { pan.forEach((v, i) => engine.setPan(i, v)) }, [pan])
  useEffect(() => { gain.forEach((v, i) => engine.setGain(i, v)) }, [gain])
  useEffect(() => { mute.forEach((v, i) => engine.setMute(i, v)) }, [mute])
  useEffect(() => { solo.forEach((v, i) => engine.setSolo(i, v)) }, [solo])

  async function handlePlay() {
    await engine.play()
    setIsPlaying(true)
  }
  async function handleStop() {
    await engine.stop()
    setIsPlaying(false)
    setIsRecording(false)
  }
  async function handleRecord() {
    if (!isRecording) {
      await engine.record(Array.from(armed))
      setIsRecording(true)
    } else {
      await engine.stopRecord()
      setIsRecording(false)
    }
  }

  return (
    <div className="app">
      <header className="row" style={{justifyContent:'space-between'}}>
        <div className="title">8‑Track Recorder <span className="badge">v0.1.0</span></div>
        <div className="transport">
          <button className="btn" onClick={handlePlay} disabled={!ready || isPlaying}>Play</button>
          <button className="btn" onClick={handleStop} disabled={!ready}>Stop</button>
          <button className="btn rec" onClick={handleRecord} disabled={!ready}>
            {isRecording ? 'Stop Rec' : 'Record'}
          </button>
          <span className={"lamp " + (isPlaying ? 'on' : '')}></span>
          <span className={"lamp " + (isRecording ? 'rec' : '')}></span>
        </div>
        <div className="row">
          <label className="tiny">Tempo</label>
          <input type="number" value={tempo} min="40" max="240" onChange={e=>setTempo(parseInt(e.target.value||'0', 10))} />
          <label className="row tiny"><input type="checkbox" checked={metronome} onChange={e=>setMetronome(e.target.checked)} /> Metronome</label>
        </div>
      </header>

      <main>
        <div className="tracks">
          {Array.from({length: TRACK_COUNT}).map((_, i) => {
            const isArmed = armed.has(i)
            return (
              <div key={i} className={"track " + (mute[i] ? 'muted' : '')}>
                <div className="row" style={{justifyContent:'space-between'}}>
                  <div className="tiny">Track {i+1}</div>
                  <button className="btn tiny" onClick={() => setArmed(prev => {
                    const n = new Set(prev)
                    n.has(i) ? n.delete(i) : n.add(i)
                    return n
                  })}>{isArmed ? 'Armed' : 'Arm'}</button>
                </div>
                <div className="knob-row">
                  <div>
                    <div className="tiny">Pan</div>
                    <input className="slider" type="range" min="-1" max="1" step="0.01"
                      value={pan[i]} onChange={e => setPan(p => Object.assign([...p], {[i]: parseFloat(e.target.value)}))} />
                  </div>
                  <div>
                    <div className="tiny">Level</div>
                    <input className="slider" type="range" min="0" max="1" step="0.01"
                      value={gain[i]} onChange={e => setGain(g => Object.assign([...g], {[i]: parseFloat(e.target.value)}))} />
                  </div>
                </div>
                <div className="row">
                  <button className="btn tiny" onClick={() => setMute(m => Object.assign([...m], {[i]: !m[i]}))}>{mute[i] ? 'Unmute' : 'Mute'}</button>
                  <button className="btn tiny" onClick={() => setSolo(s => Object.assign([...s], {[i]: !s[i]}))}>{solo[i] ? 'Unsolo' : 'Solo'}</button>
                </div>
                <div className="tiny">Status: {isArmed ? 'Ready to record' : 'Idle'}</div>
              </div>
            )
          })}
        </div>
      </main>

      <footer className="row" style={{justifyContent:'space-between'}}>
        <div className="tiny">Tip: Use wired headphones for best latency. HTTPS is required for mic access.</div>
        <div className="row">
          <button className="btn tiny" onClick={() => engine.exportMixdown()}>Mixdown (WAV)</button>
          <button className="btn tiny" onClick={() => engine.clearAll()}>Clear</button>
        </div>
      </footer>
    </div>
  )
}
