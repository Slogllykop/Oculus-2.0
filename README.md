<div align="center">

# 🔭 Oculus Screen Share

**A lightning-fast, modern, peer-to-peer screen sharing application built for privacy and performance.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![styled with Tailwind](https://img.shields.io/badge/styled_with-Tailwind_CSS-38bdf8.svg)](https://tailwindcss.com)
[![Linted with Biome](https://img.shields.io/badge/Linted_with-Biome-60A5FA.svg)](https://biomejs.dev/)

[Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**Oculus** is an open-source, peer-to-peer screen sharing ecosystem. It bypasses the need for expensive middle-man servers by connecting the broadcaster directly to the viewer securely using WebRTC. 

The project is split into two primary components:
1. **The Broadcaster (Chrome Extension)**: Captures your screen and creates a secure P2P stream.
2. **The Viewer (Next.js Application)**: A modern, accessible web interface to consume the stream without requiring any plugins or extensions.

## ✨ Features

### 📡 Broadcaster (Chrome Extension)
- **One-Click Share:** Generate a secure, unique viewing link instantly effortlessly.
- **Persistent Toolbox:** The broadcast controls remain accessible and alive safely in a background tab even if you close the extension popup.
- **Stream Controls:**
  - Dynamic visual quality adjustments: `1080p` / `720p` / `480p` / `360p`
  - Instant Audio and Microphone toggle support
  - Live viewer count analytics
  - Picture-in-Picture stream preview
  - Hassle-free screen/window switching

### 🖥️ Viewer Experience (Next.js Web App)
- **Frictionless Access:** Zero installations required for viewers. Works via a simple browser URL.
- **Auto-Connect:** Robust P2P handshake protocol via PeerJS that automatically retries connection until the broadcaster goes live.
- **Immersive:** Dedicated Theater/Full-screen mode, responsive dark mode design.

---

## 🏗️ Repository Structure

This repository uses [pnpm workspaces](https://pnpm.io/workspaces) to manage a monolithic structure smoothly.

```text
Oculus/
├── extension/          # Chrome Extension source code (Vite + React)
├── viewer/             # Viewer Web Client source code (Next.js)
├── biome.json          # Unified linting/formatting configuration
├── package.json        # Workspace configuration
└── pnpm-workspace.yaml # pnpm structure definition
```

## 🛠️ Tech Stack

- **Monorepo Manager:** `pnpm` workspaces
- **Broadcaster (Extension):** React 19, Vite, Tailwind CSS v4, `@crxjs/vite-plugin`
- **Viewer (Web App):** Next.js 15, React 19, Tailwind CSS v4, TypeScript
- **P2P Networking:** [PeerJS](https://peerjs.com/) (WebRTC wrapper)
- **Code Quality:** [Biome](https://biomejs.dev/) (Linting & Formatting)

---

## 📐 Architecture summary

Rather than routing your screen data through a centralized server, Oculus bridges you directly to your peers:

1. **Initiation:** The broadcaster clicks **Start Sharing** in the Chrome extension.
2. **Signaling:** A unique session ID is generated. The extension registers as a PeerJS peer (e.g., `oculus-{sessionId}`).
3. **Capture:** The browser's native `getDisplayMedia()` safely captures the selected screen/window.
4. **Handshake:** The viewer navigates to the generated URL (e.g., `viewer.com/watch/{sessionId}`) and automatically attempts to call the broadcaster's peer ID.
5. **Streaming:** The broadcaster answers with a `MediaStream`. Video and audio flow directly via WebRTC infrastructure.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v8 or higher)
- A Chromium-based browser (Chrome, Edge, Brave, etc.)

### 1. Installation

Clone the repository and install dependencies at the root to leverage the pnpm workspace:

```bash
git clone https://github.com/your-username/Oculus.git
cd Oculus
pnpm install
```

### 2. Viewer Website (Development)

Run the Next.js application locally for your viewers:

```bash
cd viewer
pnpm run dev
```

The viewer will be available at `http://localhost:3000`.

### 3. Chrome Extension (Development & Build)

Build the extension to be loaded into your browser:

```bash
cd extension
# To build once:
pnpm run build
# Or to watch for changes during development:
pnpm run build:watch 
```

**Load the unpacked extension in Chrome:**
1. Navigate to `chrome://extensions` in your address bar.
2. Toggle **Developer Mode** on (top right).
3. Click **Load unpacked**.
4. Select the `extension/dist/` directory.

---

## 🌍 Deployment Notes

1. **Deploying the Viewer:** The `viewer` folder is a standard Next.js application. It can be effortlessly deployed directly to [Vercel](https://vercel.com/), Netlify, or self-hosted via a Node server.
2. **Updating API References:** After deploying the viewer, locate the `VIEWER_BASE_URL` constant within the extension's codebase (e.g., `App.tsx` and `Toolbox.tsx`) and update it to point to your new live URL. Rebuild the extension.
3. **Hosting your own signaling server:** Oculus uses the Cloudflare's Realtime TURN servers which is limited to 1000Gb/month of bandwidth. Create your own credentials and put them into `.env.local` file

---

## 🤝 Contributing

We love our contributors! If you're a developer looking to improve **Oculus**, please feel free to fork this project. Here's a quick guide:

1. **Fork the repository** to your own GitHub account.
2. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. **Make your changes**. Ensure your code conforms to the project's standards by running `pnpm run lint` and `pnpm run format` (using Biome) at the root level.
4. **Commit your changes**:
   ```bash
   git commit -m "feat: Describe your feature"
   ```
5. **Push to your branch**:
   ```bash
   git push origin feature/my-new-feature
   ```
6. **Open a Pull Request** against the `main` branch.

Please ensure you've tested both the viewer and the extension simultaneously before submitting large PRs.

---

## 🛡️ License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
<div align="center">
  <b>Built with ❤️ by Slogllykop and Oculus Community</b>
</div>
