# 8‑Track Recorder

Open‑source web Portastudio inspired by the Tascam DP‑03SD. This is a **starter repo** scaffold: Vite + React, CI for GitHub Pages, and a minimal 8‑track UI. The audio engine is a simple placeholder you can evolve per the roadmap.

## Quick Start
```bash
npm i
npm run dev   # HTTPS dev server for mic access
```

## Build & Deploy (GitHub Pages)
1. Create a repo named `8-track-recorder` and push this project.
2. Ensure Actions are enabled.
3. The workflow in `.github/workflows/pages.yml` builds and deploys to Pages automatically on pushes to `main`.
4. The Vite `base` path is auto‑derived from the repo name for Pages.

## Status
- UI: 8 tracks with pan, level, mute/solo, arm, transport controls.
- Engine: placeholder structure (record/play basic). See `src/audio/engine.js`.

## Roadmap (short)
- Sample‑accurate scheduling per track
- Overdub monitoring + latency wizard
- Punch‑in/out; markers; metronome accents
- Per‑track EQ + global reverb
- WAV mixdown & stems via OfflineAudioContext
- Project save/load via IndexedDB; export/import zip
- Undo/redo; accessibility pass

## License
MIT © 2025 8‑track recorder contributors
