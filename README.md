# NavGuard - Secure Traveler Safety App

<div align="center">
  <img src="public/navguard-icon-144px.svg" alt="NavGuard Banner" width="30%"/>
  
  <h1>NavGuard</h1>
  <h3><strong>Blockchain-inspired Secure Digital Identity + Real-time Safety for Travelers in High-Risk Terrains</strong></h3>

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

## 📸 Project Screenshots

<div align="center">

<img src="Screenshots/OCR_uploading.png" width="48%" alt="Document Upload"/>
<img src="Screenshots/OCR_result.png" width="48%" alt="OCR Result"/>
<img src="Screenshots/Secure_ID.png" width="48%" alt="Secure ID"/>
<img src="Screenshots/GeoFencing_Map.png" width="48%" alt="Geo Mapping"/>

</div>

---

## 🚀 How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/adithyan-sys/NAV-GUARD.git
cd NAV-GUARD

---
