# 🔭 Oculus — Peer-to-Peer Screen Sharing

A modern, dark-mode P2P screen sharing app consisting of:
- **`extension/`** — Chrome extension (broadcaster)
- **`viewer/`** — Next.js website (viewer)

---

## Architecture

```
Broadcaster (Chrome Extension)
  └── Captures screen via getDisplayMedia
  └── Creates PeerJS peer with ID: oculus-{sessionId}
  └── Answers incoming calls with MediaStream
  └── Opens toolbox tab (stays alive even when popup closes)

Viewer (Next.js website)
  └── Visits /watch/{sessionId}
  └── Creates anonymous PeerJS peer
  └── Calls oculus-{sessionId} to receive MediaStream
  └── Plays stream in <video> element
```

---

## Getting Started

### 1. Viewer Website

```bash
cd viewer
npm install
npm run dev        # http://localhost:3000
```

For production, deploy to Vercel:
```bash
cd viewer
npx vercel
```
Then update `VIEWER_BASE_URL` in both:
- `extension/src/App.tsx`
- `extension/src/components/Toolbox.tsx`

### 2. Chrome Extension

```bash
cd extension
npm install
npm run build      # outputs to extension/dist/
```

**Load in Chrome:**
1. Open `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `extension/dist/` folder

---

## Features

### Extension (Broadcaster)
- **Popup** — Click "Start Sharing" to generate a unique share URL
- **Toolbox Tab** — Full control panel that stays alive when popup is closed:
  - Quality selector: 1080p / 720p / 480p / 360p
  - Audio toggle (mic on/off)
  - Live viewer count
  - Stop broadcast button
  - Change screen button
  - Live preview of your stream

### Viewer Website
- Auto-connects to broadcaster via P2P (PeerJS)
- Retries automatically until broadcaster goes live
- Full-screen support
- Mute toggle
- Works on any device, any browser

---

## Tech Stack

| Part | Stack |
|------|-------|
| Extension | React 18, Vite, Tailwind CSS, PeerJS, Biome |
| Viewer | Next.js 15, Tailwind CSS, PeerJS, TypeScript |
| Streaming | PeerJS (WebRTC peer-to-peer) |
| Signaling | PeerJS Cloud (0.peerjs.com) |

---

## Development

### Extension dev mode
```bash
cd extension
npm run build:watch   # auto-rebuilds on change
```
Reload the extension in Chrome after each build.

### Viewer dev mode
```bash
cd viewer
npm run dev
```

---

## Deployment Notes

- The viewer can be deployed to **Vercel**, **Netlify**, or any Node.js host
- After deploying, update the `VIEWER_BASE_URL` constant in the extension source files and rebuild
- PeerJS uses the free public signaling server by default — for production use, consider [self-hosting PeerJS server](https://github.com/peers/peerjs-server)

---

## How it Works

1. Broadcaster clicks **Start Sharing** in the Chrome extension popup
2. A unique session ID (`uuid`) is generated
3. The toolbox tab opens and registers as a PeerJS peer: `oculus-{sessionId}`
4. `getDisplayMedia()` captures the screen
5. A shareable URL is generated: `https://your-viewer.com/watch/{sessionId}`
6. When a viewer opens the URL, they create a PeerJS connection and call the broadcaster peer
7. The broadcaster answers with the `MediaStream` — video streams P2P!
8. The extension popup can be closed — the toolbox tab keeps streaming
