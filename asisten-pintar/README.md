# Asisten Pintar - Dashboard RAG AI

Asisten Pintar adalah aplikasi antarmuka untuk berinteraksi dengan model LLM (Claude/Gemini/GPT) menggunakan teknologi RAG (Retrieval-Augmented Generation). Aplikasi ini dapat memproses file PDF, teks, Markdown, dan Jupyter Notebook yang akan disimpan ke dalam database vektor lokal (ChromaDB) untuk kemudian menjadi landasan konteks setiap jawaban AI.

## Struktur Repositori
Aplikasi ini terbagi menjadi 2 bagian yang dikonsolidasikan dalam satu direktori `asisten-pintar`:
- **Frontend**: React + Vite + Tailwind CSS.
- **Backend**: FastAPI + ChromaDB + SentenceTransformers (di `backend.py`).

## Prasyarat
- **Node.js**: v18 atau lebih baru.
- **Python**: v3.10 atau lebih baru.

## Instalasi

1. **Masuk Direktori**
   ```bash
   cd asisten-pintar
   ```

2. **Instalasi Frontend (React)**
   ```bash
   npm install
   ```

3. **Instalasi Backend (Python)**
   ```bash
   pip install -r requirements.txt
   ```

4. **Konfigurasi Environment**
   - Salin `.env.example` ke `.env` dan isi variable sesuai dengan server AI Anda.

## Menjalankan Aplikasi Lokal (Development)
Saat development, Anda perlu menjalankan kedua server:

1. **Jalankan Backend (FastAPI)**
   ```bash
   npm run backend
   # Atau manual: python backend.py
   ```
   Backend akan berjalan di port `8000`.

2. **Jalankan Frontend (Vite)**
   ```bash
   npm run dev
   ```
   Vite akan terbuka (default port `5173`) dan memproksi semua *request* ke `/api` langsung menuju backend.

## Menjalankan Mode Produksi
Pada mode produksi, FastAPI dapat menyajikan frontend React secara langsung dari satu server.

1. **Build Frontend**
   ```bash
   npm run build
   ```
   Ini akan menghasilkan bundel di folder `dist/`.

2. **Jalankan Backend**
   ```bash
   python backend.py --port 8000
   ```
   Buka `http://localhost:8000`. Backend akan melayani API (di path `/api`) sekaligus web secara langsung.
