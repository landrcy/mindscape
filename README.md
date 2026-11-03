# Mindscape — a VisionQuest fan hub

Walk through Vision's mind: six rooms, six voices. Zero-build HTML/CSS/JS (single-page app with hash routes).
Built for Finley & Landry. **Unofficial fan project: not affiliated with or endorsed by Marvel or Disney.**

## Run
- Open `index.html` directly (file:// works), or
- `cd mindscape && python3 -m http.server 8000`, then go to http://localhost:8000/
- GitHub Pages: serve from the repo root on `main`. No build step.

## Rooms (`#hash`, key)
1. `#vision` (1) Conscience: philosophical intro, a 3D Mind Stone orb with parallax, room cards
2. `#ultron` (2) Manifesto: long-form prose in Ultron's voice, chrome type, a glitch telemetry readout
3. `#jarvis` (3) Systems: status list, radar, animated ledger bars, an interactive console (`help`, `status`, `protocols`, `tea`, `ultron`, `clear`)
4. `#friday` (4) Tactical ops: crew briefings with warm Irish wit, mission board
5. `#edith` (5) Game theory: iterated prisoner's dilemma against tit-for-tat with 10% noise, plus a targeting sandbox that shoots confetti sparks
6. `#dume` (6) Maintenance: safety notices, a self-diagnostic, and a DO NOT PRESS button (foam bubbles, a soft red alarm pulse, and a funny message)

Keyboard: `1`–`6` jump between rooms, `←`/`→` cycle through them, `Esc` closes the mobile menu. There is a skip link, visible focus rings, and `prefers-reduced-motion` support.

## Structure
- `index.html` is the shell (loader, parallax background, nav, footer)
- `css/styles.css` holds the themes (one set of CSS custom properties per room via `body[data-room]`), layout, and animation
- `js/rooms.js` holds the room content (edit the copy here)
- `js/app.js` handles the router, the circular-wipe transition, parallax, the particle canvas, and the per-room interactions

## Audio
No audio yet. If sound is added later, use only CC0 files and credit them here.
