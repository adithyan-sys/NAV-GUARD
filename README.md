<div align="center">
  <img src="<?xml version="1.0" encoding="UTF-8"?>
<svg width="280" height="100" viewBox="0 0 280 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cShield" x1="50" y1="10" x2="50" y2="92" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1A4E80" />
      <stop offset="100%" stop-color="#071D35" />
    </linearGradient>
    <linearGradient id="cPin" x1="50" y1="36" x2="50" y2="66" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00D48C" />
      <stop offset="100%" stop-color="#009E65" />
    </linearGradient>
  </defs>
  
  <!-- Background (optional, remove for transparent) -->
  <rect width="280" height="100" rx="20" fill="#081E36"/>
  
  <!-- Icon -->
  <g transform="translate(26, 24)">
    <g transform="scale(0.52)">
      <path d="M50 10 L84 24 L84 54 C84 73 69 86 50 93 C31 86 16 73 16 54 L16 24 Z" fill="url(#cShield)" />
      <path d="M50 10 L84 24 L84 54 C84 73 69 86 50 93 C31 86 16 73 16 54 L16 24 Z" fill="none" stroke="#00B87A" stroke-width="2" stroke-opacity="0.9" />
      <path d="M50 36 C43 36 37.5 41.5 37.5 48.5 C37.5 57.5 50 70 50 70 C50 70 62.5 57.5 62.5 48.5 C62.5 41.5 57 36 50 36 Z" fill="white" opacity="0.96" />
      <circle cx="50" cy="48.5" r="7" fill="url(#cPin)" />
      <circle cx="50" cy="48.5" r="2.6" fill="white" />
    </g>
  </g>
  
  <!-- Text -->
  <text x="78" y="48" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="800" letter-spacing="-1">
    <tspan fill="#FFFFFF">Nav</tspan><tspan fill="#00B87A">Guard</tspan>
  </text>
  <text x="78" y="62" font-family="system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="600" letter-spacing="3" fill="#3D87A8" text-transform="uppercase">
    TRAVEL SAFE.STAY VERIFIED
  </text>
</svg>" alt="NavGuard Banner" width="100%"/>
  
  <h1>NavGuard</h1>
  <p><strong>Blockchain-inspired Secure Digital Identity + Real-time Safety for Travelers in High-Risk Terrains</strong></p>

  <a href="https://github.com/adithyan-sys/NAV-GUARD/stargazers">
    <img src="https://img.shields.io/github/stars/adithyan-sys/NAV-GUARD?style=for-the-badge" alt="Stars"/>
  </a>
  <a href="https://github.com/adithyan-sys/NAV-GUARD/issues">
    <img src="https://img.shields.io/github/issues/adithyan-sys/NAV-GUARD?style=for-the-badge" alt="Issues"/>
  </a>
  <a href="https://github.com/adithyan-sys/NAV-GUARD">
    <img src="https://img.shields.io/badge/Platform-React%20%2B%20Flask-blue?style=for-the-badge" alt="Platform"/>
  </a>
</div>

<br>

## 🚀 About NavGuard

**NavGuard** is a privacy-first traveler safety application designed for high-risk terrains like the **Himalayas and Western Ghats**. It provides a **tamper-proof Secure Digital Identity**, real-time geo-fencing with risk alerts, and a powerful one-tap Emergency SOS with live video proof.

**No more sharing raw Aadhaar or PAN cards.**  
Your identity is now protected using secure hashing.

---

## ✨ Key Features

- **Secure Digital ID**  
  Upload documents → Extract data using OCR → Generate unique SHA-256 Secure ID (Name + Document ID)

- **Smart Document Upload & OCR**  
  Supports Aadhaar, PAN Card, Passport. Extracts Name, ID Number, DOB, and Gender.

- **Real-time Geo-Fencing & Risk Alerts**  
  Color-coded risk zones (🟢 Safe | 🟡 Caution | 🔴 High Risk) using Google Maps API.

- **Emergency SOS with Video Proof**  
  One-tap SOS → Record live video → Send location + video to nearest police, hospital & rescue teams.

- **Privacy First**  
  Only hashed data is used. Fully aligned with DPDP Act.

---

## 🛠 Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | React.js + Vite + Tailwind CSS      |
| Backend        | Python + Flask                      |
| OCR            | OpenBharatOCR                       |
| Maps           | Google Maps API                     |
| Hashing        | CryptoJS (SHA-256)                  |
| Deployment     | Vercel (Frontend) + Render (Backend)|

---

## 📸 Screenshots

*(Add your actual screenshots here)*

![Document Upload](https://via.placeholder.com/600x400/111827/00d4aa?text=Document+Upload+%26+OCR)
![Secure ID Generation](https://via.placeholder.com/600x400/111827/00d4aa?text=Secure+Digital+ID)
![Geo-Fencing Map](https://via.placeholder.com/600x400/111827/00d4aa?text=Geo-Fencing+%26+Risk+Alerts)
![Emergency SOS](https://via.placeholder.com/600x400/111827/00d4aa?text=Emergency+SOS+with+Video)

---

## 🚀 How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/adithyan-sys/NAV-GUARD.git
cd NAV-GUARD
