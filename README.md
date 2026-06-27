# Personal.AI 🛡️✨

> **Safe and Secure Personal AI Companion for Individual, Family & Social Challenges**

Personal.AI is a privacy-first, zero-knowledge intelligent personal assistant built specifically to streamline people's daily lives—from managing complicated medication schedules to planning garden projects and organizing family party invite lists—while keeping all personal information 100% safe and secure on-device.

---

## 🎯 Challenge Alignment & Track Solutions

Personal.AI directly addresses real-world individual, family, and social challenges while guaranteeing hardware-grade data security:

| Challenge Scenario | How Personal.AI Solves It Safely |
| :--- | :--- |
| 💊 **Managing Complicated Medications** | Tracks daily prescription schedules and dosage routines in your planner and habit tracker. Medical records and Rx numbers are stored inside a Web Crypto AES-GCM 256-bit vault. |
| 🎉 **Party Invites & Social Events** | Organizes guest invite lists, RSVPs, and party tasks while using local PII redactors to ensure personal phone numbers and emails never leak. |
| 🪴 **Planning a Garden Project** | Manages seasonal planting schedules, soil orders, and watering routines via Eisenhower matrix task breakdowns. |
| 🛡️ **Privacy & Data Protection** | Operates on a Zero-Knowledge local paradigm—zero telemetry, zero network databases, zero third-party trackers. |

---

## 🌟 Key Features

### 📋 1. Eisenhower Smart Planner
* **Strategic Prioritization**: Categorize commitments into four actionable quadrants:
  * 🔴 **Do First** (Urgent & High Impact e.g., Daily Medications)
  * 🔵 **Schedule** (Strategic & Important e.g., Garden Planning)
  * 🟡 **Quick Action / Delegate** (Urgent & Low Impact e.g., Party Supplies)
  * ⚪ **De-prioritize / Archive** (Low Urgency & Low Impact)
* **Search & Category Filtering**: Filter by tags (*Health*, *Social*, *Home*, *Security*).

### ⏲️ 2. Focus & Productivity Timer (Pomodoro)
* **Preset Modes**: Switch between **Deep Work (25m)**, **Short Break (5m)**, and **Long Break (15m)**.
* **Visual Ring Track**: Dynamic SVG progress visualization.
* **Audio Notifications**: Web Audio API synth completion chimes with zero external assets.

### 🌿 3. Habit & Routine Tracker
* **Consistency Monitoring**: Track daily routines and build streaks for health habits, garden watering, and family check-ins.
* **Category Filtering**: Filter routines by *Health & Medication*, *Social & Family*, *Home & Garden*, and *Productivity*.

### 🔒 4. Hardware-Grade Cryptographic Vault
* **Web Crypto AES-GCM 256-bit**: Encrypt confidential medical records, prescriptions (Rx), and private contacts using PBKDF2 key derivation (100,000 iterations).
* **Auto-Clearing Clipboard**: Copy decrypted credentials with single-click auto-wipe safety (clipboard clears automatically after 15 seconds).

### 🤖 5. Safe AI Companion
* **Real-Time PII Masking**: Automatically redacts emails, phone numbers, Rx numbers, SSNs, and credit cards before prompt processing.
* **Track Solution Chips**: Dedicated quick prompt chips for **Party Invites**, **Medication Schedules**, and **Garden Planning**.
* **Action Dispatcher**: Ask Personal.AI to *"Plan party invites"* or *"Manage medication schedule"* to automatically generate structured tasks in your matrix!

---

## 🛡️ Security & Privacy Architecture

* **Local Storage Isolation**: Data is stored exclusively inside browser `localStorage`.
* **Zero Telemetry**: Zero external tracking scripts, remote servers, or third-party analytical cookies.
* **Hardware Cryptography**: Secrets are encrypted on the client side before persistence using `window.crypto.subtle`.

---

## 🚀 Quick Start & Local Setup

### Direct Launch (Zero Setup)
1. Clone or download this repository.
2. Open `index.html` directly in any modern web browser (Chrome, Edge, Brave, Firefox).

### Local Development Server
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
* **Styling**: Modern CSS3 (Custom Design System, Dark Mode, Glassmorphism, Responsive Grid/Flexbox).
* **Icons**: [Lucide Icons](https://lucide.dev/).
* **Security**: Native Browser Web Crypto API (`window.crypto.subtle`).

---

## 📄 License

This project is licensed under the MIT License.
