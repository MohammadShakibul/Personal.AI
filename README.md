# Personal.AI 🛡️✨

> **A Privacy-First, Zero-Knowledge Personal Assistant & Productivity Suite**

Personal.AI is a modern, web-based intelligent personal assistant designed to streamline your daily workflow—organizing tasks, tracking habits, and securing confidential notes—without compromising your personal privacy. All data is processed on-device and stored locally inside your browser using hardware-accelerated cryptographic security.

---

## 🌟 Key Features

### 📋 1. Eisenhower Smart Planner
* **Strategic Prioritization**: Organize tasks into four actionable quadrants based on urgency and importance:
  * 🔴 **Do First** (Urgent & High Impact)
  * 🔵 **Schedule** (Strategic & Important)
  * 🟡 **Quick Action / Delegate** (Urgent & Low Impact)
  * ⚪ **De-prioritize / Archive** (Low Urgency & Low Impact)
* **Real-Time Filter & Search**: Instant keyword search and category tagging (*Security*, *Planning*, *Operations*, *Maintenance*).

### ⏲️ 2. Focus & Productivity Timer (Pomodoro)
* **Preset Work Modes**: Switch seamlessly between **Deep Work (25m)**, **Short Break (5m)**, and **Long Break (15m)**.
* **Visual Ring Track**: Dynamic SVG progress visualization.
* **Audio Notifications**: Web Audio API synth completion chimes with zero external audio assets.

### 🌿 3. Habit & Routine Tracker
* **Consistency Monitoring**: Build positive habits and track daily completion streaks.
* **Category Filtering**: Filter routines by *Health & Wellness*, *Productivity*, *Mindfulness*, and *Learning*.

### 🔒 4. Hardware-Grade Cryptographic Vault
* **Web Crypto AES-GCM 256-bit**: Encrypt private keys, passcodes, and sensitive notes using browser-native cryptography with PBKDF2 key derivation (100,000 iterations).
* **Auto-Clearing Clipboard**: Copy decrypted credentials with single-click auto-wipe safety (clipboard clears automatically after 15 seconds).

### 🤖 5. Safe AI Companion
* **On-Device Guardrails**: Automatic real-time PII redaction (masking emails, IP addresses, phone numbers, SSNs, and credit cards) before prompt processing.
* **Action Dispatcher**: Ask Personal.AI to *"Create a task..."* to automatically generate and save structured tasks directly into your matrix.
* **Quick Prompt Chips**: Pre-configured templates for instant daily planning and habit streak analysis.

---

## 🛡️ Security & Privacy Architecture

Personal.AI operates under a strict **Zero-Knowledge Architecture**:

* **Local Storage Isolation**: Tasks, routines, and notes are saved exclusively in browser `localStorage`.
* **Zero Telemetry**: No third-party tracking scripts, external analytics, or remote database synchronization.
* **Hardware Cryptography**: Secrets are encrypted on the client side before persistence.

---

## 🚀 Quick Start & Local Setup

### Direct Launch (Zero Setup)
1. Clone or download this repository.
2. Open `index.html` directly in any modern web browser (Chrome, Edge, Brave, Firefox).

### Local Development Server
For the best experience with Web Crypto API and Service Workers, run via a local web server:

```bash
# Using Node / npx
npx serve ./

# Using Python
python -m http.server 8000
```
Then navigate to `http://localhost:8000`.

---

## 🛠️ Built With

* **Core**: Semantic HTML5, Vanilla ES6+ JavaScript.
* **Styling**: Modern CSS3 (Custom Design System, Dark Mode, Glassmorphism, Responsive CSS Grid/Flexbox).
* **Icons**: [Lucide Icons](https://lucide.dev/).
* **Security**: Native Browser Web Crypto API (`window.crypto.subtle`).

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
