# 🍪 Kalkulator Dapur Ibu — Optimasi Produksi Kue

Aplikasi web Single-Page Application untuk menyelesaikan masalah **Linear Programming** menggunakan **Metode Grafis** secara step-by-step.

> Proyek Akhir Mata Kuliah Teknik Riset Operasi

---

## Tech Stack

| Bagian    | Teknologi                                  |
|-----------|--------------------------------------------|
| Backend   | Python 3 · FastAPI · Pydantic · SciPy · NumPy |
| Frontend  | Next.js 16 (App Router) · Tailwind CSS v4 · Chart.js |

---

## Cara Menjalankan

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API tersedia di: `http://localhost:8000`  
Dokumentasi Swagger: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka browser: `http://localhost:3000`

---

## Struktur Proyek

```
optimasi-produksi-kue/
├── backend/
│   ├── main.py        ← FastAPI app, endpoint POST /solve
│   ├── solver.py      ← Algoritma Metode Grafis manual + linprog checker
│   ├── schemas.py     ← Pydantic request/response models
│   └── requirements.txt
└── frontend/
    └── app/
        ├── page.tsx   ← SPA utama (input + visualizer + hasil)
        ├── layout.tsx
        └── globals.css
```

---

## Endpoint API

### `POST /solve`

**Request Body:**
```json
{
  "stok_tepung": 2000,
  "stok_mentega": 1500,
  "stok_telur": 20,
  "keuntungan_nastar": 50000,
  "keuntungan_kastengel": 60000,
  "waktu_nastar": 2,
  "waktu_kastengel": 1,
  "waktu_luang": 12
}
```

**Response:** Array `steps` berisi langkah-langkah dengan struktur:
```json
{
  "status": "success",
  "steps": [
    {
      "step_id": 1,
      "narasi": "...",
      "visual": { "type": "add_line", "data": { ... } }
    }
  ],
  "hasil": {
    "x1_nastar": 3.6,
    "x2_kastengel": 4.8,
    "x1_floor": 3,
    "x2_floor": 4,
    "z_optimal": 468000.0,
    "z_floor": 390000,
    "titik_optimum_label": "C",
    "corner_points": [ ... ]
  }
}
```

**Tipe visual:**
| Type               | Deskripsi                                      |
|--------------------|------------------------------------------------|
| `add_line`         | Gambar garis kendala di grafik                 |
| `add_point`        | Tandai titik sudut (corner point)              |
| `shade_polygon`    | Arsir Daerah Layak (Feasible Region)           |
| `highlight_optimum`| Highlight titik solusi optimal                 |
| `none`             | Narasi teks saja, tidak ada aksi visual        |
| `error`            | Langkah error — infeasible / singular          |

---

## Model Matematika

**Fungsi Tujuan:**  
Maks Z = C₁x₁ + C₂x₂  
*(C₁ = keuntungan Nastar, C₂ = keuntungan Kastengel)*

**Kendala:**
1. Tepung  : 250x₁ + 200x₂ ≤ Stok Tepung
2. Mentega : 150x₁ + 200x₂ ≤ Stok Mentega
3. Telur   :   2x₁ +   1x₂ ≤ Stok Telur
4. Waktu   :  t₁x₁ +  t₂x₂ ≤ Waktu Luang
5. Non-negativitas: x₁ ≥ 0, x₂ ≥ 0
