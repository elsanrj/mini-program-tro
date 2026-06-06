# LAPORAN PROYEK AKHIR
## Teknik Riset Operasi
### Kalkulator Dapur Ibu — Optimasi Produksi Kue dengan Linear Programming Metode Grafis

---

**Disusun oleh:**
- Elsa Nurjanah (2306206)
- Nina Wulandari (2312091)

**Mata Kuliah:** Teknik Riset Operasi  
**Tahun Akademik:** 2025/2026

---

## DAFTAR ISI

1. [Deskripsi Studi Kasus](#1-deskripsi-studi-kasus)
2. [Metode yang Digunakan](#2-metode-yang-digunakan)
3. [Proses dan Hasil Penyelesaian](#3-proses-dan-hasil-penyelesaian)
4. [Alur Sistem dan Deskripsi Program](#4-alur-sistem-dan-deskripsi-program)

---

## 1. Deskripsi Studi Kasus

### 1.1 Latar Belakang Masalah

Produksi kue rumahan merupakan salah satu usaha mikro yang cukup populer di masyarakat Indonesia, terutama menjelang momen-momen tertentu seperti hari raya. Dalam skala usaha kecil, seorang pengusaha kue sering kali menghadapi kendala keterbatasan sumber daya — mulai dari bahan baku seperti tepung, mentega, dan telur, hingga keterbatasan waktu yang dimiliki.

Studi kasus ini mengangkat permasalahan seorang Ibu yang memproduksi dua jenis kue toples, yaitu **Nastar** dan **Kastengel**. Setiap harinya, Ibu memiliki stok bahan baku yang terbatas dan waktu produksi yang terbatas pula. Di sisi lain, setiap jenis kue memberikan keuntungan yang berbeda per toples. Permasalahan yang muncul adalah:

> **Berapa toples Nastar (x₁) dan Kastengel (x₂) yang harus diproduksi setiap harinya agar keuntungan total yang diperoleh menjadi maksimal, dengan tetap memperhatikan keterbatasan stok bahan baku dan waktu yang tersedia?**

### 1.2 Identifikasi Variabel

| Simbol | Keterangan |
|--------|-----------|
| x₁ | Jumlah toples Nastar yang diproduksi |
| x₂ | Jumlah toples Kastengel yang diproduksi |
| Z  | Total keuntungan (dalam Rupiah) yang ingin dimaksimalkan |

### 1.3 Sumber Daya yang Terbatas (Kendala)

Setiap toples kue membutuhkan bahan baku tertentu. Berdasarkan resep standar, kebutuhan bahan per toples adalah sebagai berikut:

| Bahan Baku / Sumber Daya | Kebutuhan per Toples Nastar (x₁) | Kebutuhan per Toples Kastengel (x₂) | Stok Tersedia (Default) |
|--------------------------|----------------------------------|--------------------------------------|------------------------|
| Tepung Terigu (gram)     | 250 gram                         | 200 gram                             | 2.000 gram             |
| Mentega (gram)           | 150 gram                         | 200 gram                             | 1.500 gram             |
| Telur (butir)            | 2 butir                          | 1 butir                              | 20 butir               |
| Waktu Produksi (jam)     | 2 jam/toples                     | 1 jam/toples                         | 12 jam                 |

### 1.4 Fungsi Tujuan

Keuntungan per toples yang dijual:
- Keuntungan Nastar: **Rp 50.000 per toples**
- Keuntungan Kastengel: **Rp 60.000 per toples**

Sehingga fungsi tujuan (yang ingin dimaksimalkan) adalah:

```
Maks Z = 50.000·x₁ + 60.000·x₂
```

### 1.5 Tujuan Penyelesaian

Tujuan dari studi kasus ini adalah:
1. Menentukan **kombinasi jumlah produksi** Nastar (x₁) dan Kastengel (x₂) yang optimal.
2. Mendapatkan **nilai keuntungan maksimal** yang bisa diraih dengan keterbatasan sumber daya yang ada.
3. Memberikan **visualisasi interaktif** proses penyelesaian agar mudah dipahami secara bertahap.
4. Menyajikan hasil yang **realistis** (pembulatan ke bawah karena produksi harus bilangan bulat).

---

## 2. Metode yang Digunakan

### 2.1 Linear Programming (Program Linear)

**Linear Programming (LP)** atau Program Linear adalah metode matematis dalam **Riset Operasi** yang digunakan untuk mengoptimalkan (memaksimalkan atau meminimalkan) suatu fungsi tujuan linear, dengan tunduk pada sekumpulan kendala yang juga berbentuk pertidaksamaan atau persamaan linear.

LP memiliki tiga komponen utama:
1. **Fungsi Tujuan (Objective Function):** Fungsi yang ingin dioptimalkan.
2. **Kendala (Constraints):** Batasan-batasan yang harus dipenuhi oleh solusi.
3. **Non-negativitas:** Variabel keputusan tidak boleh negatif (x₁ ≥ 0, x₂ ≥ 0).

### 2.2 Metode Grafis (Graphical Method)

Pada studi kasus ini dipilih **Metode Grafis**, yaitu metode penyelesaian LP yang bekerja dengan cara memplot setiap kendala sebagai garis lurus pada bidang koordinat Kartesius dua dimensi, kemudian mengidentifikasi **Daerah Layak (Feasible Region)** dan mengevaluasi fungsi tujuan pada setiap **Titik Sudut (Corner Point)** dari daerah layak tersebut.

#### Alasan Pemilihan Metode Grafis

| Alasan | Penjelasan |
|--------|-----------|
| **Dua variabel keputusan** | Metode Grafis paling efektif dan intuitif untuk masalah LP dengan 2 variabel (x₁ dan x₂). Studi kasus Nastar-Kastengel hanya melibatkan dua variabel, sehingga metode grafis sangat tepat. |
| **Visualisasi yang jelas** | Metode ini menghasilkan visualisasi geometris yang mudah dipahami — daerah layak digambarkan sebagai poligon, dan solusi optimal terlihat jelas sebagai titik sudut. |
| **Edukasi & transparansi** | Setiap langkah dapat dijelaskan secara bertahap (step-by-step), membuatnya ideal sebagai alat pembelajaran Riset Operasi. |
| **Fondasi teori LP** | Metode Grafis mendemonstrasikan Teorema Titik Ekstrem: *solusi optimal selalu terdapat pada salah satu titik sudut dari daerah layak* — dasar dari semua algoritma LP termasuk Simplex. |

#### Teorema yang Mendasari

> **Teorema Titik Ekstrem (Extreme Point Theorem):**  
> Jika masalah LP memiliki solusi optimal, maka solusi tersebut pasti terdapat pada salah satu titik sudut (extreme point / vertex) dari daerah layak yang berbentuk konveks (convex polytope).

### 2.3 Formulasi Matematis

**Fungsi Tujuan:**
```
Maks Z = C₁·x₁ + C₂·x₂
```
Dimana C₁ = keuntungan Nastar, C₂ = keuntungan Kastengel.

**Kendala-kendala:**
```
[1] Kendala Tepung  : 250·x₁ + 200·x₂ ≤ Stok Tepung
[2] Kendala Mentega : 150·x₁ + 200·x₂ ≤ Stok Mentega
[3] Kendala Telur   :   2·x₁ +   1·x₂ ≤ Stok Telur
[4] Kendala Waktu   :  t₁·x₁ +  t₂·x₂ ≤ Waktu Luang
[5] Non-negativitas :  x₁ ≥ 0, x₂ ≥ 0
```

### 2.4 Langkah-Langkah Metode Grafis

Secara sistematis, Metode Grafis diselesaikan melalui 5 langkah utama:

```
Langkah 1 → Gambar garis setiap kendala pada bidang koordinat
Langkah 2 → Hitung titik potong antar pasangan garis kendala
Langkah 3 → Identifikasi Daerah Layak (Feasible Region)
Langkah 4 → Evaluasi nilai Z pada setiap titik sudut
Langkah 5 → Tentukan titik dengan nilai Z maksimum sebagai solusi optimal
```

### 2.5 Validasi dengan Metode Simplex (linprog)

Sebagai mekanisme **verifikasi internal**, program menggunakan `scipy.optimize.linprog` dengan algoritma **HiGHS** (implementasi modern dari metode Simplex/Interior Point) untuk memvalidasi hasil yang diperoleh secara manual. Validasi ini tidak ditampilkan kepada pengguna, melainkan hanya dicatat pada server log. Jika selisih antara hasil manual dan linprog melebihi Rp 1, sistem mencatat peringatan.

---

## 3. Proses dan Hasil Penyelesaian

### 3.1 Data Input (Contoh Default)

| Parameter | Nilai |
|-----------|-------|
| Stok Tepung | 2.000 gram |
| Stok Mentega | 1.500 gram |
| Stok Telur | 20 butir |
| Keuntungan Nastar | Rp 50.000/toples |
| Keuntungan Kastengel | Rp 60.000/toples |
| Waktu Nastar | 2 jam/toples |
| Waktu Kastengel | 1 jam/toples |
| Waktu Luang | 12 jam |

### 3.2 Langkah 1: Menggambar Garis Kendala

Setiap kendala diubah menjadi persamaan garis lurus (mengganti ≤ dengan =), lalu dicari titik potong sumbu x₁ (saat x₂ = 0) dan sumbu x₂ (saat x₁ = 0):

**Kendala Tepung:** 250x₁ + 200x₂ = 2000
- x₂ = 0 → x₁ = 2000/250 = **8**
- x₁ = 0 → x₂ = 2000/200 = **10**
- Titik: **(8, 0)** dan **(0, 10)**

**Kendala Mentega:** 150x₁ + 200x₂ = 1500
- x₂ = 0 → x₁ = 1500/150 = **10**
- x₁ = 0 → x₂ = 1500/200 = **7,5**
- Titik: **(10, 0)** dan **(0, 7,5)**

**Kendala Telur:** 2x₁ + 1x₂ = 20
- x₂ = 0 → x₁ = 20/2 = **10**
- x₁ = 0 → x₂ = 20/1 = **20**
- Titik: **(10, 0)** dan **(0, 20)**

**Kendala Waktu:** 2x₁ + 1x₂ = 12
- x₂ = 0 → x₁ = 12/2 = **6**
- x₁ = 0 → x₂ = 12/1 = **12**
- Titik: **(6, 0)** dan **(0, 12)**

### 3.3 Langkah 2: Mencari Titik Potong Antar Garis Kendala

Setiap pasangan garis diselesaikan sebagai sistem persamaan linear 2×2 menggunakan eliminasi Gauss (dalam program menggunakan `numpy.linalg.solve`).

**Perpotongan Tepung × Mentega:**
```
250x₁ + 200x₂ = 2000  ...(i)
150x₁ + 200x₂ = 1500  ...(ii)

(i) - (ii): 100x₁ = 500  →  x₁ = 5
Substitusi ke (ii): 150(5) + 200x₂ = 1500  →  x₂ = 3,75

Titik (5, 3,75) → perlu cek kelayakan semua kendala
```

**Perpotongan Tepung × Waktu:**
```
250x₁ + 200x₂ = 2000  ...(i)
  2x₁ +   x₂ = 12    ...(ii) → x₂ = 12 - 2x₁

Substitusi: 250x₁ + 200(12 - 2x₁) = 2000
            250x₁ + 2400 - 400x₁ = 2000
            -150x₁ = -400  →  x₁ = 2,667
            x₂ = 12 - 2(2,667) = 6,667

Titik (2,667, 6,667) → perlu cek kelayakan
```

**Perpotongan Mentega × Waktu (contoh titik optimum):**
```
150x₁ + 200x₂ = 1500  ...(i)
  2x₁ +   x₂ = 12    ...(ii) → x₂ = 12 - 2x₁

Substitusi: 150x₁ + 200(12 - 2x₁) = 1500
            150x₁ + 2400 - 400x₁ = 1500
            -250x₁ = -900  →  x₁ = 3,6
            x₂ = 12 - 2(3,6) = 4,8

Titik (3,6, 4,8) → diperiksa: memenuhi SEMUA kendala ✓
```

### 3.4 Langkah 3: Menentukan Daerah Layak (Feasible Region)

Dari semua kandidat titik yang dihitung, difilter hanya yang memenuhi **semua** kendala (x₁ ≥ 0, x₂ ≥ 0, dan setiap pertidaksamaan). Titik-titik layak kemudian diurutkan menggunakan **Convex Hull** (scipy.spatial.ConvexHull) untuk membentuk poligon daerah layak.

Titik sudut (corner points) yang terbentuk pada contoh default:

| Label | x₁ (Nastar) | x₂ (Kastengel) | Keterangan |
|-------|-------------|-----------------|-----------|
| A     | 0           | 0               | Titik asal |
| B     | 6           | 0               | Intercept Waktu pada sumbu x₁ |
| C     | 3,6         | 4,8             | Mentega ∩ Waktu |
| D     | 2,667       | 6,667           | Tepung ∩ Waktu |
| E     | 0           | 7,5             | Intercept Mentega pada sumbu x₂ |

### 3.5 Langkah 4: Evaluasi Nilai Z pada Setiap Titik Sudut

Z = 50.000·x₁ + 60.000·x₂

| Titik | x₁   | x₂    | Z = 50.000x₁ + 60.000x₂ |
|-------|------|-------|--------------------------|
| A     | 0    | 0     | **Rp 0**                 |
| B     | 6    | 0     | **Rp 300.000**           |
| C     | 3,6  | 4,8   | **Rp 468.000** ← OPTIMAL |
| D     | 2,667| 6,667 | **Rp 533.350**           |
| E     | 0    | 7,5   | **Rp 450.000**           |

> [!NOTE]
> Nilai Z dievaluasi di setiap titik sudut karena berdasarkan Teorema Titik Ekstrem, solusi optimal **selalu** berada di salah satu titik sudut dari daerah layak konveks.

### 3.6 Langkah 5: Menentukan Solusi Optimal

Nilai Z terbesar terdapat pada **Titik C (3,6 ; 4,8)**:
```
Z* = 50.000 × 3,6 + 60.000 × 4,8
   = 180.000 + 288.000
   = Rp 468.000
```

### 3.7 Hasil Akhir dan Interpretasi

**Solusi Optimal (Eksak):**
- Produksi Nastar: **x₁ = 3,6 toples**
- Produksi Kastengel: **x₂ = 4,8 toples**
- Keuntungan Maksimal: **Z = Rp 468.000**

**Solusi Realistis (Pembulatan ke Bawah — *Floor*):**

Karena produksi kue tidak bisa dalam satuan pecahan (harus bilangan bulat utuh), dilakukan pembulatan ke bawah:
- Produksi Nastar: **x₁ = 3 toples**
- Produksi Kastengel: **x₂ = 4 toples**
- Keuntungan (floor): **Z_floor = 50.000×3 + 60.000×4 = Rp 390.000**

### 3.8 Analisis Solusi

**Analisis Kendala Aktif (Binding Constraints):**  
Pada titik optimal (3,6 ; 4,8), kendala yang aktif (terpenuhi secara persis) adalah:
- **Kendala Mentega:** 150(3,6) + 200(4,8) = 540 + 960 = 1.500 ✓ (binding)
- **Kendala Waktu:** 2(3,6) + 1(4,8) = 7,2 + 4,8 = 12 ✓ (binding)

Kendala tepung dan telur **tidak aktif** (slack > 0):
- Tepung: 250(3,6) + 200(4,8) = 900 + 960 = 1.860 ≤ 2.000 (sisa 140 gram)
- Telur: 2(3,6) + 1(4,8) = 7,2 + 4,8 = 12 ≤ 20 (sisa 8 butir)

**Interpretasi Manajerial:**  
Sumber daya yang menjadi **bottleneck** adalah **mentega** dan **waktu**. Untuk meningkatkan keuntungan lebih lanjut, sebaiknya menambah stok mentega atau jam kerja produksi terlebih dahulu — bukan tepung atau telur yang masih bersisa.

---

## 4. Alur Sistem dan Deskripsi Program

### 4.1 Arsitektur Sistem

Program **Kalkulator Dapur Ibu** dibangun sebagai aplikasi web dengan arsitektur **Client-Server** dua tier:

```
┌──────────────────────────────────────────────────────────┐
│                    BROWSER (CLIENT)                       │
│                                                          │
│  ┌─────────────────────────────────────────────────┐     │
│  │         Next.js 16 (React) + TypeScript          │     │
│  │         Tailwind CSS v4 + Chart.js               │     │
│  │         Frontend: http://localhost:3000           │     │
│  └─────────────────────┬───────────────────────────┘     │
└────────────────────────┼─────────────────────────────────┘
                         │ HTTP POST /solve
                         │ JSON Request/Response
                         ▼
┌──────────────────────────────────────────────────────────┐
│                    SERVER (BACKEND)                       │
│                                                          │
│  ┌─────────────────────────────────────────────────┐     │
│  │           FastAPI (Python) + Uvicorn             │     │
│  │           NumPy + SciPy                          │     │
│  │           Backend: http://localhost:8000          │     │
│  └─────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

**Stack Teknologi:**

| Layer    | Teknologi                                          | Fungsi |
|----------|----------------------------------------------------|--------|
| Backend  | Python 3, FastAPI 0.115, Uvicorn 0.32              | REST API server, logika komputasi |
| Komputasi| NumPy 2.2, SciPy 1.14                              | Aljabar linear, Convex Hull, linprog |
| Validasi | Pydantic 2.10                                      | Validasi request/response schema |
| Frontend | Next.js 16 (App Router), TypeScript                | SPA, UI interaktif |
| Styling  | Tailwind CSS v4, Google Fonts                      | Desain antarmuka |
| Grafik   | Chart.js + react-chartjs-2                         | Visualisasi grafik LP |

### 4.2 Flowchart Alur Sistem

```
         ┌─────────────────────────────────┐
         │         MULAI                   │
         └────────────────┬────────────────┘
                          │
                          ▼
         ┌─────────────────────────────────┐
         │  Pengguna isi form input:       │
         │  - Stok Tepung, Mentega, Telur  │
         │  - Keuntungan Nastar/Kastengel  │
         │  - Waktu produksi & waktu luang │
         └────────────────┬────────────────┘
                          │
                          ▼
         ┌─────────────────────────────────┐
         │  Klik tombol "Hitung            │
         │  Keuntungan Maksimal!"          │
         └────────────────┬────────────────┘
                          │
                          ▼
         ┌─────────────────────────────────┐
         │  Frontend kirim HTTP POST       │
         │  ke /solve dengan JSON body     │
         └────────────────┬────────────────┘
                          │
                          ▼
         ┌─────────────────────────────────┐
         │  Backend terima request,        │
         │  Pydantic validasi input        │
         └────────────────┬────────────────┘
                          │
              ┌───────────▼──────────┐
              │  Input valid?        │
              └───┬───────────────┬──┘
                  │ YA            │ TIDAK
                  ▼               ▼
    ┌─────────────────┐    ┌────────────────────┐
    │ Panggil         │    │ Kembalikan HTTP 422 │
    │ build_steps()   │    │ Validation Error    │
    └────────┬────────┘    └────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────────┐
    │  LANGKAH 1: Definisi & gambar           │
    │  garis setiap kendala (add_line)        │
    └──────────────────┬──────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────┐
    │  LANGKAH 2: Hitung titik potong         │
    │  antar pasangan garis (2×2 system)      │
    │  menggunakan numpy.linalg.solve         │
    └──────────────────┬──────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────┐
    │  LANGKAH 3: Filter titik feasible       │
    │  (Kuadran I + semua kendala terpenuhi)  │
    └──────────────────┬──────────────────────┘
                       │
              ┌────────▼────────┐
              │  Titik layak    │
              │  ≥ 3 ?          │
              └──┬──────────┬───┘
                 │ YA       │ TIDAK
                 ▼          ▼
    ┌──────────────┐  ┌─────────────────────┐
    │ Lanjutkan    │  │ Status: INFEASIBLE   │
    └──────┬───────┘  │ Kembalikan error    │
           │          └─────────────────────┘
           ▼
    ┌─────────────────────────────────────────┐
    │  Urutkan corner points dengan           │
    │  scipy.spatial.ConvexHull               │
    │  → shade_polygon (arsir daerah layak)   │
    └──────────────────┬──────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────┐
    │  LANGKAH 4: Evaluasi Z di setiap        │
    │  corner point (add_point + z_value)     │
    └──────────────────┬──────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────┐
    │  LANGKAH 5: Tentukan titik dengan       │
    │  Z maksimum → highlight_optimum         │
    └──────────────────┬──────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────┐
    │  Validasi internal dengan linprog       │
    │  (HiGHS) — catat ke server log         │
    └──────────────────┬──────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────┐
    │  Kembalikan SolveResponse:              │
    │  { status, steps[], hasil }             │
    └──────────────────┬──────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────┐
    │  Frontend terima steps,                 │
    │  tampilkan langkah [1] pertama          │
    └──────────────────┬──────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────┐
    │  Pengguna klik "Langkah Selanjutnya"    │
    │  atau "▶ Auto Play"                    │
    └──────────────────┬──────────────────────┘
                       │
              ┌────────▼────────┐
              │  Semua langkah  │
              │  selesai?       │
              └──┬──────────┬───┘
                 │ TIDAK    │ YA
                 │          ▼
                 │  ┌───────────────────────────┐
                 │  │  Tampilkan Ringkasan Hasil │
                 │  │  - Keuntungan Maksimal     │
                 │  │  - Jumlah produksi optimal │
                 │  │  - Tabel corner points     │
                 │  └───────────────────────────┘
                 │
                 └──► Tampilkan langkah berikutnya
                      (update terminal + grafik)
                       │
                       ▼
         ┌─────────────────────────────────┐
         │              SELESAI            │
         └─────────────────────────────────┘
```

### 4.3 Deskripsi Komponen Program

#### 4.3.1 Backend — `main.py` (Entry Point FastAPI)

File `main.py` adalah titik masuk aplikasi backend. Fungsi-fungsi utama:

| Komponen | Deskripsi |
|----------|-----------|
| `@app.post("/solve")` | Endpoint utama yang menerima data input bahan baku, memanggil `build_steps()`, dan mengembalikan array langkah penyelesaian beserta hasil ringkasan. |
| `@app.get("/health")` | Endpoint health check untuk memastikan server berjalan. |
| `CORSMiddleware` | Mengizinkan komunikasi lintas domain antara frontend (port 3000) dan backend (port 8000). |
| Logging | Mencatat setiap request dan response termasuk validasi linprog ke stdout. |

#### 4.3.2 Backend — `schemas.py` (Pydantic Models)

File `schemas.py` mendefinisikan struktur data yang digunakan untuk validasi input/output:

| Schema | Deskripsi |
|--------|-----------|
| `SolveRequest` | Model request dengan validasi: semua nilai harus > 0. Field dengan nilai default (keuntungan, waktu) tidak wajib diisi. |
| `VisualInstruction` | Instruksi visual per langkah: `type` menentukan aksi grafis, `data` berisi koordinat/parameter. |
| `SolutionStep` | Satu langkah penyelesaian: terdiri dari `step_id`, `narasi` (teks penjelasan), dan `visual` (instruksi grafik). |
| `SolveResponse` | Response lengkap: `status`, array `steps[]`, dan `hasil` (ringkasan solusi optimal). |

#### 4.3.3 Backend — `solver.py` (Algoritma Utama)

File `solver.py` adalah inti komputasi yang mengimplementasikan seluruh algoritma Metode Grafis:

| Fungsi | Deskripsi |
|--------|-----------|
| `build_steps()` | Fungsi utama. Menerima semua parameter input, membangun array step-by-step, dan mengembalikan `(status, steps, hasil)`. |
| `_intercepts(a, b, rhs)` | Helper: menghitung titik potong garis `ax + by = rhs` pada sumbu x₁ dan x₂. |
| `_intersect(a1,b1,rhs1, a2,b2,rhs2)` | Helper: menyelesaikan sistem 2 persamaan linear menggunakan `numpy.linalg.solve`. Mengembalikan `None` jika garis sejajar. |
| `_is_feasible(x1, x2, constraints)` | Helper: mengecek apakah titik (x₁, x₂) memenuhi semua kendala dengan toleransi numerik `1e-6`. |
| `_fmt(v)` | Helper: format angka desimal (hilangkan .0 jika bilangan bulat). |
| `_fmt_rp(v)` | Helper: format angka sebagai format Rupiah Indonesia. |

**Alur internal `build_steps()`:**
```python
1. Definisikan 4 kendala sebagai list of dict
2. Step intro (narasi + vis_type="none")
3. Loop: untuk setiap kendala → hitung intercept → add_line step
4. Loop: untuk setiap pasangan kendala → hitung interseksi → add_point jika feasible
5. Filter unique feasible points, deduplikasi
6. Cek minimum 3 titik (jika tidak → infeasible)
7. ConvexHull → urutkan corner points → shade_polygon step
8. Loop: evaluasi Z di setiap corner point → add_point step dengan z_value
9. argmax(Z) → tentukan titik optimum → highlight_optimum step
10. Validasi dengan linprog (internal, tidak masuk steps)
11. Kembalikan (status, steps, hasil_dict)
```

#### 4.3.4 Frontend — `page.tsx` (Komponen Utama React)

File `page.tsx` adalah Single Page Application yang mengelola seluruh UI:

| Komponen | Deskripsi |
|----------|-----------|
| `Home()` | Komponen halaman utama. Mengelola state form, state langkah animasi, state hasil, dan orkestrasi seluruh UI. |
| `InputField` | Komponen input formulir dengan label, unit satuan, dan styling konsisten. |
| `Accordion` | Komponen lipat-buka untuk pengaturan lanjutan (advanced settings) dengan animasi smooth max-height. |
| `GraphVisualizer` | Komponen grafik interaktif menggunakan Chart.js Scatter Chart. Memproses `visibleSteps` untuk merender garis kendala, poligon daerah layak, titik sudut, dan titik optimum. |
| `CornerTable` | Tabel evaluasi semua titik sudut dengan highlight baris titik optimal. |
| `handleSolve()` | Async function: kirim POST request ke backend, terima response, simpan semua langkah, mulai dari step 1. |
| `handleNextStep()` | Increment `currentStep` untuk menampilkan langkah berikutnya. |
| `handleAutoPlay()` | Interval timer 600ms yang otomatis menampilkan satu langkah per 0,6 detik. |

**State Management:**

| State | Tipe | Deskripsi |
|-------|------|-----------|
| `stokTepung/Mentega/Telur` | `number` | Input utama stok bahan baku |
| `adv` | `object` | Input lanjutan (keuntungan, waktu) |
| `allSteps` | `SolutionStep[]` | Semua langkah yang diterima dari backend |
| `currentStep` | `number` | Index langkah yang sedang ditampilkan |
| `hasil` | `SolveResponse['hasil']` | Ringkasan hasil optimal |
| `status` | `string` | `'success'` / `'infeasible'` / `'error'` |
| `loading` | `boolean` | Status loading saat request berlangsung |
| `showResult` | `boolean` | Toggle tampilkan panel hasil |

### 4.4 Tipe Visual Instruksi

Backend mengkomunikasikan aksi grafis kepada frontend melalui field `visual.type` di setiap langkah:

| Tipe Visual | Aksi pada Grafik | Data yang Dikirim |
|------------|------------------|-------------------|
| `add_line` | Gambar garis kendala baru sebagai dataset Chart.js | `label`, `color`, `points: [{x,y}, {x,y}]` |
| `add_point` | Tambahkan titik sudut pada grafik scatter | `x`, `y`, `label`, `z_value`, `feasible` |
| `shade_polygon` | Arsir daerah layak sebagai poligon tertutup | `points: [{x,y},...]`, `color`, `borderColor` |
| `highlight_optimum` | Tandai titik optimal dengan marker merah besar | `x`, `y`, `label`, `z_value` |
| `none` | Hanya narasi teks, tidak ada aksi grafis | `null` |
| `error` | Tampilkan pesan error pada terminal | `null` |

### 4.5 Dokumentasi API Endpoint

#### `POST /solve`

**Request Body (JSON):**

```json
{
  "stok_tepung":          2000,   // gram, wajib, > 0
  "stok_mentega":         1500,   // gram, wajib, > 0
  "stok_telur":           20,     // butir, wajib, > 0
  "keuntungan_nastar":    50000,  // Rp, opsional (default 50.000)
  "keuntungan_kastengel": 60000,  // Rp, opsional (default 60.000)
  "waktu_nastar":         2,      // jam, opsional (default 2.0)
  "waktu_kastengel":      1,      // jam, opsional (default 1.0)
  "waktu_luang":          12      // jam, opsional (default 12.0)
}
```

**Response Body (JSON):**

```json
{
  "status": "success",
  "steps": [
    {
      "step_id": 1,
      "narasi": "=== KALKULATOR DAPUR IBU: OPTIMASI PRODUKSI KUE ===\n...",
      "visual": {
        "type": "none",
        "data": null
      }
    },
    {
      "step_id": 3,
      "narasi": "Garis Kendala Tepung: 250·x₁ + 200·x₂ = 2000\n...",
      "visual": {
        "type": "add_line",
        "data": {
          "label": "Kendala Tepung",
          "color": "#8B4513",
          "points": [{"x": 8, "y": 0}, {"x": 0, "y": 10}]
        }
      }
    }
  ],
  "hasil": {
    "x1_nastar": 3.6,
    "x2_kastengel": 4.8,
    "x1_floor": 3,
    "x2_floor": 4,
    "z_optimal": 468000.0,
    "z_floor": 390000.0,
    "titik_optimum_label": "C",
    "corner_points": [
      {"label": "A", "x1": 0.0,  "x2": 0.0,  "z": 0.0},
      {"label": "B", "x1": 6.0,  "x2": 0.0,  "z": 300000.0},
      {"label": "C", "x1": 3.6,  "x2": 4.8,  "z": 468000.0},
      {"label": "D", "x1": 2.667,"x2": 6.667,"z": 533350.0},
      {"label": "E", "x1": 0.0,  "x2": 7.5,  "z": 450000.0}
    ]
  }
}
```

**Status Response:**
| Status | HTTP Code | Kondisi |
|--------|-----------|---------|
| `success` | 200 | Solusi optimal ditemukan |
| `infeasible` | 200 | Daerah layak tidak terbentuk (< 3 titik) |
| `error` | 200 | Input menyebabkan kalkulasi tidak valid |

#### `GET /health`

```json
{ "status": "ok", "service": "Kalkulator Dapur Ibu API" }
```

### 4.6 Fitur Utama Program

| Fitur | Deskripsi |
|-------|-----------|
| **Input Dinamis** | Pengguna dapat mengubah semua parameter (stok bahan baku, keuntungan, waktu) secara bebas |
| **Pengaturan Lanjutan** | Parameter sekunder disembunyikan dalam Accordion yang dapat dibuka-tutup dengan animasi |
| **Step-by-Step Navigation** | Pengguna dapat maju langkah demi langkah dengan tombol "Langkah Selanjutnya" |
| **Auto Play** | Mode pemutaran otomatis dengan interval 600ms per langkah |
| **Terminal Visualizer** | Narasi penyelesaian ditampilkan dalam gaya terminal dengan cursor berkedip |
| **Grafik Interaktif** | Grafik diperbarui secara progresif seiring langkah — garis kendala, daerah layak, dan titik sudut muncul bertahap |
| **Validasi Error** | Pesan error informatif jika stok terlalu kecil (infeasible) atau server tidak bisa dihubungi |
| **Ringkasan Hasil** | Setelah semua langkah selesai, ditampilkan: keuntungan maksimal, jumlah produksi, dan tabel evaluasi corner points |
| **Nilai Floor** | Program secara otomatis menghitung nilai pembulatan ke bawah untuk solusi produksi yang realistis |
| **Validasi Internal** | Backend memvalidasi hasil manual dengan linprog HiGHS sebagai safeguard numerik |

---

## Kesimpulan

Proyek **Kalkulator Dapur Ibu** berhasil mengimplementasikan solusi **Linear Programming Metode Grafis** untuk studi kasus optimasi produksi kue Nastar dan Kastengel. Dengan nilai input default (stok tepung 2.000 gram, mentega 1.500 gram, telur 20 butir, waktu luang 12 jam), diperoleh:

- **Solusi Optimal:** Produksi 3,6 toples Nastar dan 4,8 toples Kastengel
- **Keuntungan Maksimal:** Rp 468.000
- **Solusi Realistis (Floor):** 3 toples Nastar + 4 toples Kastengel = Rp 390.000
- **Bottleneck:** Mentega dan waktu produksi (kedua kendala bersifat binding pada titik optimal)

Program dirancang dengan pendekatan **pedagogis**: setiap langkah dijelaskan secara naratif disertai visualisasi grafis yang diperbarui secara progresif, sehingga pengguna dapat memahami proses Metode Grafis secara intuitif dan interaktif.

---

*Proyek Akhir Mata Kuliah Teknik Riset Operasi*  
*Program Studi Teknik Informatika — 2025/2026*
