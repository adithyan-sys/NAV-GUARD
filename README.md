# NavGuard - Secure Traveler Safety App

![NavGuard Banner](https://via.placeholder.com/1200x400/0a1428/00b894?text=NavGuard+-+Secure+Traveler+Safety)

**A privacy-first, blockchain-inspired traveler safety application for high-risk terrains in India (Himalayas & Western Ghats).**

NavGuard provides a **tamper-proof Secure Digital Identity**, real-time geo-fencing with AI risk alerts, and a powerful one-tap Emergency SOS system with live video proof.

---

## ✨ Features

- **Secure Digital ID**  
  Upload Aadhaar, PAN, or Passport → Extract data using OCR → Generate unique SHA-256 based Secure ID (combining name + document ID). No raw sensitive data is stored.

- **Document Upload & OCR**  
  Supports PAN Card, Passport, and Aadhaar. Extracts Name, ID Number, DOB, and Gender using OpenBharatOCR.

- **Geo-Fencing & Risk Alerts**  
  Real-time location tracking with color-coded risk zones (Green = Safe, Yellow = Caution, Red = High Risk) using Google Maps API.

- **Emergency SOS**  
  One-tap SOS with live video recording as proof. Sends alert with location and video to nearest help centers (Police, Hospital, Rescue teams).

- **Privacy Focused**  
  Only hashed data is used for identity. Fully aligned with DPDP Act principles.

---

## 🛠 Tech Stack

- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Python + Flask
- **OCR**: OpenBharatOCR
- **Mapping**: Google Maps API
- **Hashing**: CryptoJS (SHA-256)
- **Deployment Ready**: Vercel / Render (Frontend + Backend)

---

## 📸 Screenshots

*(Add screenshots here once you upload them to the repo)*

- Document Upload & OCR Screen
  
- Secure Digital ID Generation  
- Geo-Fencing Map View  
- Emergency SOS Interface  

---

## 🚀 How to Run Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
