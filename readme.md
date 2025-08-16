# 🤖 Chatbot UI dengan TailwindCSS

Chatbot UI sederhana berbasis **HTML, TailwindCSS, dan JavaScript**.  
Mendukung **Upload file (image, audio, document)**, **dark/light mode**, **chat history (localStorage)**, serta integrasi dengan backend (Node.js + Express + Multer).

---

## ✨ Fitur

- 💬 Chatbox dengan UI modern (TailwindCSS).
- 📂 Upload attachment (image, audio, document).
- 🔄 Preview attachment + hapus sebelum kirim.
- ⌨️ Textarea auto-resize, max 500 karakter.
- 🕒 Timestamp pada setiap chat.
- 🌓 Switch tema Dark/Light.
- 💾 Chat history tersimpan di `localStorage`.
- 🗑️ Clear history dengan konfirmasi.
- 📡 Integrasi backend dengan endpoint:
  - `/generate-text`
  - `/generate-from-image`
  - `/generate-from-audio`
  - `/generate-from-document`
- ⏳ Loading overlay ketika request ke backend.

---

## 🛠️ Teknologi

- **Frontend**: HTML + TailwindCSS + Vanilla JS  
- **Backend**: Node.js, Express.js  
- **Upload**: Multer  
- **Storage**: LocalStorage (client), `./uploads` (server)  

---

## 📂 Struktur Project

project-root/
│── /public
│   ├── /icons         # Icon bot, favicon, og-banner
│   ├── /uploads       # Tempat file upload tersimpan
│   ├── script.js      # Logic frontend (chat, preview, theme, history)
│   ├── style.css      # Styling tambahan frontend
│   └── index.html     # UI utama
│
│── /routes
│   ├── gemini-api.js  # Endpoint: generate-text, generate-from-image, generate-from-audio, generate-from-document
│   └── upload.js      # Endpoint: add/remove attachment
│
│── index.js           # Entry point Express server
│── server.js          # Konfigurasi server
│── package.json
│── README.md


---

## ⚙️ Konfigurasi Backend

File upload tersimpan di folder `./public/uploads`.  

### Endpoint tersedia:
- `POST /generate-text` → kirim teks
- `POST /generate-from-image` → kirim teks + gambar
- `POST /generate-from-audio` → kirim teks + audio
- `POST /generate-from-document` → kirim teks + dokumen

---

## 🚀 Cara Menjalankan

### 1️⃣ Clone Repo
```bash
git clone https://github.com/pneymaaa/gemini-ai-api-project
cd gemini-ai-api-project
npm install
npm run dev