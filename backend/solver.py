"""
solver.py
=========
Implementasi manual Metode Grafis Linear Programming.

Alur utama (build_steps):
  1. Definisikan & gambar setiap garis kendala  (add_line)
  2. Hitung semua titik potong antar pasangan garis + sumbu  (add_point)
  3. Filter titik: hanya di Kuadran I dan memenuhi SEMUA kendala
  4. Urutkan corner points dengan scipy.spatial.ConvexHull  (shade_polygon)
  5. Evaluasi Z di setiap corner point  (add_point per titik)
  6. Tentukan titik optimum  (highlight_optimum)
  7. Validasi dengan scipy.optimize.linprog sebagai checker internal

linprog TIDAK muncul di steps — hanya dicatat di log server.
"""

from __future__ import annotations

import logging
import math
from itertools import combinations
from typing import Any

import numpy as np
from scipy.optimize import linprog
from scipy.spatial import ConvexHull, QhullError

from schemas import SolutionStep, VisualInstruction

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Konstanta warna per kendala (urutan tetap)
# ---------------------------------------------------------------------------
CONSTRAINT_COLORS = ["#8B4513", "#D4A017", "#2E7D32", "#1565C0"]
CONSTRAINT_NAMES = ["Kendala Tepung", "Kendala Mentega", "Kendala Telur", "Kendala Waktu"]

# Toleransi numerik untuk pengecekan "memenuhi kendala"
FEASIBILITY_TOL = 1e-6


# ---------------------------------------------------------------------------
# Helper: hitung intercept garis  a*x1 + b*x2 = rhs
# ---------------------------------------------------------------------------
def _intercepts(a: float, b: float, rhs: float) -> dict[str, float | None]:
    """Kembalikan titik potong sumbu x1 (x2=0) dan x2 (x1=0)."""
    x1_int = rhs / a if abs(a) > 1e-12 else None
    x2_int = rhs / b if abs(b) > 1e-12 else None
    return {"x1": x1_int, "x2": x2_int}


# ---------------------------------------------------------------------------
# Helper: selesaikan 2 persamaan linear  A·x = b
# ---------------------------------------------------------------------------
def _intersect(
    a1: float, b1: float, rhs1: float,
    a2: float, b2: float, rhs2: float,
) -> tuple[float, float] | None:
    """
    Kembalikan (x1, x2) titik potong dua garis, atau None jika sejajar/singular.
    """
    A = np.array([[a1, b1], [a2, b2]], dtype=float)
    b = np.array([rhs1, rhs2], dtype=float)
    try:
        x = np.linalg.solve(A, b)
        return float(x[0]), float(x[1])
    except np.linalg.LinAlgError:
        return None


# ---------------------------------------------------------------------------
# Helper: cek apakah titik memenuhi semua kendala (Ax ≤ rhs) + non-negatif
# ---------------------------------------------------------------------------
def _is_feasible(
    x1: float, x2: float,
    constraints: list[dict],
    tol: float = FEASIBILITY_TOL,
) -> bool:
    if x1 < -tol or x2 < -tol:
        return False
    for c in constraints:
        lhs = c["a1"] * x1 + c["a2"] * x2
        if lhs > c["rhs"] + tol:
            return False
    return True


# ---------------------------------------------------------------------------
# Helper: format angka cantik (hilangkan .0 jika bulat)
# ---------------------------------------------------------------------------
def _fmt(v: float, decimals: int = 4) -> str:
    rounded = round(v, decimals)
    if rounded == int(rounded):
        return str(int(rounded))
    return str(rounded)


def _fmt_rp(v: float) -> str:
    return f"Rp {int(v):,}".replace(",", ".")


# ---------------------------------------------------------------------------
# FUNGSI UTAMA
# ---------------------------------------------------------------------------
def build_steps(
    stok_tepung: float,
    stok_mentega: float,
    stok_telur: float,
    keuntungan_nastar: float,
    keuntungan_kastengel: float,
    waktu_nastar: float,
    waktu_kastengel: float,
    waktu_luang: float,
) -> tuple[str, list[SolutionStep], dict[str, Any] | None]:
    """
    Bangun array step-by-step penyelesaian Metode Grafis.

    Returns:
        status : 'success' | 'infeasible' | 'error'
        steps  : list[SolutionStep]
        hasil  : dict ringkasan (None jika gagal)
    """
    steps: list[SolutionStep] = []
    step_id = 0

    def _add(narasi: str, vis_type: str, vis_data: Any = None) -> None:
        nonlocal step_id
        step_id += 1
        steps.append(
            SolutionStep(
                step_id=step_id,
                narasi=narasi,
                visual=VisualInstruction(type=vis_type, data=vis_data),
            )
        )

    def _error_step(msg: str) -> tuple[str, list[SolutionStep], None]:
        _add(msg, "error", None)
        return "error", steps, None

    def _infeasible_step(msg: str) -> tuple[str, list[SolutionStep], None]:
        _add(msg, "error", None)
        return "infeasible", steps, None

    # ------------------------------------------------------------------
    # 0. Definisikan kendala
    # ------------------------------------------------------------------
    constraints = [
        {"name": "Kendala Tepung",  "a1": 250.0, "a2": 200.0, "rhs": stok_tepung,  "color": CONSTRAINT_COLORS[0]},
        {"name": "Kendala Mentega", "a1": 150.0, "a2": 200.0, "rhs": stok_mentega, "color": CONSTRAINT_COLORS[1]},
        {"name": "Kendala Telur",   "a1": 2.0,   "a2": 1.0,   "rhs": stok_telur,   "color": CONSTRAINT_COLORS[2]},
        {"name": "Kendala Waktu",   "a1": float(waktu_nastar), "a2": float(waktu_kastengel), "rhs": waktu_luang, "color": CONSTRAINT_COLORS[3]},
    ]

    # Langkah intro
    _add(
        narasi=(
            "=== KALKULATOR DAPUR IBU: OPTIMASI PRODUKSI KUE ===\n\n"
            f"Fungsi Tujuan: Maks Z = {_fmt_rp(keuntungan_nastar)}·x₁ + {_fmt_rp(keuntungan_kastengel)}·x₂\n\n"
            "Kendala yang berlaku:\n"
            f"  [1] Tepung  : 250·x₁ + 200·x₂ ≤ {_fmt(stok_tepung)} gram\n"
            f"  [2] Mentega : 150·x₁ + 200·x₂ ≤ {_fmt(stok_mentega)} gram\n"
            f"  [3] Telur   : 2·x₁ + 1·x₂ ≤ {_fmt(stok_telur)} butir\n"
            f"  [4] Waktu   : {_fmt(waktu_nastar)}·x₁ + {_fmt(waktu_kastengel)}·x₂ ≤ {_fmt(waktu_luang)} jam\n"
            "  [5] Non-negativitas: x₁ ≥ 0, x₂ ≥ 0\n\n"
            "Memulai penyelesaian dengan Metode Grafis..."
        ),
        vis_type="none",
    )

    # ------------------------------------------------------------------
    # 1. Gambar setiap garis kendala (add_line)
    # ------------------------------------------------------------------
    _add(
        narasi="LANGKAH 1 — Menggambar Garis-Garis Kendala\n\nSetiap kendala diubah menjadi persamaan garis lurus dengan mengganti ≤ menjadi =, lalu dihitung titik potong pada sumbu x₁ dan x₂.",
        vis_type="none",
    )

    for c in constraints:
        ic = _intercepts(c["a1"], c["a2"], c["rhs"])
        pts = []

        if ic["x1"] is not None and ic["x1"] >= 0:
            pts.append({"x": round(ic["x1"], 6), "y": 0, "label": f"({_fmt(ic['x1'])}, 0)"})
        if ic["x2"] is not None and ic["x2"] >= 0:
            pts.append({"x": 0, "y": round(ic["x2"], 6), "label": f"(0, {_fmt(ic['x2'])})"})

        if len(pts) < 2:
            return _error_step(
                f"⚠ Evaluasi dihentikan: {c['name']} menghasilkan intercept tidak valid "
                f"(koefisien menghasilkan titik potong negatif atau tak terhingga). "
                f"Periksa nilai stok/waktu yang dimasukkan."
            )

        _add(
            narasi=(
                f"Garis {c['name']}: {_fmt(c['a1'])}·x₁ + {_fmt(c['a2'])}·x₂ = {_fmt(c['rhs'])}\n"
                f"  → Jika x₂ = 0  :  x₁ = {_fmt(c['rhs'])}/{_fmt(c['a1'])} = {_fmt(ic['x1'])}\n"
                f"  → Jika x₁ = 0  :  x₂ = {_fmt(c['rhs'])}/{_fmt(c['a2'])} = {_fmt(ic['x2'])}\n"
                f"  Titik: ({_fmt(ic['x1'])}, 0) dan (0, {_fmt(ic['x2'])})"
            ),
            vis_type="add_line",
            vis_data={
                "label": c["name"],
                "color": c["color"],
                "points": pts,
            },
        )

    # ------------------------------------------------------------------
    # 2. Hitung semua titik potong antar pasangan kendala + titik asal
    # ------------------------------------------------------------------
    _add(
        narasi=(
            "LANGKAH 2 — Mencari Titik Potong Antar Garis Kendala\n\n"
            "Setiap pasangan garis diselesaikan sebagai sistem persamaan linear 2×2 "
            "menggunakan eliminasi Gauss. Titik yang berada di luar Kuadran I (x₁<0 atau x₂<0) "
            "langsung dieliminasi."
        ),
        vis_type="none",
    )

    candidate_points: list[dict] = []

    # Titik asal (0,0) — selalu kandidat awal
    if _is_feasible(0.0, 0.0, constraints):
        candidate_points.append({"x1": 0.0, "x2": 0.0, "source": "Titik Asal (0, 0)"})

    # Intercept sumbu tiap kendala (x2=0 dan x1=0)
    for c in constraints:
        ic = _intercepts(c["a1"], c["a2"], c["rhs"])
        for pt_x1, pt_x2, lbl in [
            (ic["x1"], 0.0, f"Intercept x₁-sumbu {c['name']}"),
            (0.0, ic["x2"], f"Intercept x₂-sumbu {c['name']}"),
        ]:
            if pt_x1 is not None and pt_x2 is not None:
                if _is_feasible(pt_x1, pt_x2, constraints):
                    candidate_points.append({"x1": pt_x1, "x2": pt_x2, "source": lbl})

    # Perpotongan antar pasangan kendala
    n = len(constraints)
    for i, j in combinations(range(n), 2):
        ci, cj = constraints[i], constraints[j]
        result = _intersect(ci["a1"], ci["a2"], ci["rhs"], cj["a1"], cj["a2"], cj["rhs"])

        if result is None:
            _add(
                narasi=(
                    f"  Perpotongan [{ci['name']}] × [{cj['name']}]:\n"
                    "  → Kedua garis sejajar (determinan = 0). Tidak ada titik potong, dilewati."
                ),
                vis_type="none",
            )
            continue

        x1, x2 = result

        if x1 < -FEASIBILITY_TOL or x2 < -FEASIBILITY_TOL:
            _add(
                narasi=(
                    f"  Perpotongan [{ci['name']}] × [{cj['name']}]:\n"
                    f"  → Titik ({_fmt(x1)}, {_fmt(x2)}) berada di luar Kuadran I. Dieliminasi."
                ),
                vis_type="none",
            )
            continue

        feasible = _is_feasible(x1, x2, constraints)
        x1_c, x2_c = max(0.0, x1), max(0.0, x2)

        label_pt = chr(65 + len(candidate_points))  # A, B, C, ...
        narasi_pt = (
            f"  Perpotongan [{ci['name']}] × [{cj['name']}]:\n"
            f"  Sistem: {_fmt(ci['a1'])}x₁ + {_fmt(ci['a2'])}x₂ = {_fmt(ci['rhs'])}\n"
            f"          {_fmt(cj['a1'])}x₁ + {_fmt(cj['a2'])}x₂ = {_fmt(cj['rhs'])}\n"
            f"  → Solusi: x₁ = {_fmt(x1_c)}, x₂ = {_fmt(x2_c)}\n"
        )

        if feasible:
            narasi_pt += f"  ✓ Titik {label_pt} ({_fmt(x1_c)}, {_fmt(x2_c)}) memenuhi semua kendala → masuk Daerah Layak."
            candidate_points.append({"x1": x1_c, "x2": x2_c, "source": f"{ci['name']} ∩ {cj['name']}"})
            _add(
                narasi=narasi_pt,
                vis_type="add_point",
                vis_data={"x": round(x1_c, 6), "y": round(x2_c, 6), "label": label_pt, "feasible": True},
            )
        else:
            narasi_pt += f"  ✗ Titik ({_fmt(x1_c)}, {_fmt(x2_c)}) melanggar salah satu kendala → dibuang."
            _add(narasi=narasi_pt, vis_type="none")

    # ------------------------------------------------------------------
    # 3. Filter: hanya titik feasible unik
    # ------------------------------------------------------------------
    feasible_points = [
        p for p in candidate_points
        if _is_feasible(p["x1"], p["x2"], constraints)
    ]

    # Deduplikasi berdasarkan koordinat (toleransi 1e-4)
    unique_pts: list[dict] = []
    for p in feasible_points:
        is_dup = any(
            abs(p["x1"] - u["x1"]) < 1e-4 and abs(p["x2"] - u["x2"]) < 1e-4
            for u in unique_pts
        )
        if not is_dup:
            unique_pts.append(p)

    if len(unique_pts) < 3:
        return _infeasible_step(
            "⚠ Evaluasi dihentikan: Daerah Layak tidak ditemukan.\n\n"
            f"Hanya {len(unique_pts)} titik layak yang teridentifikasi (minimum 3 diperlukan untuk membentuk daerah layak). "
            "Kemungkinan penyebab: stok bahan baku terlalu kecil atau kombinasi kendala bersifat infeasible. "
            "Coba naikkan nilai stok bahan baku."
        )

    # ------------------------------------------------------------------
    # 4. Urutkan corner points dengan ConvexHull
    # ------------------------------------------------------------------
    pts_array = np.array([[p["x1"], p["x2"]] for p in unique_pts])

    try:
        if len(unique_pts) == 3:
            # ConvexHull butuh minimal 3 titik non-kolinear
            hull_order = list(range(3))
        else:
            hull = ConvexHull(pts_array)
            hull_order = list(hull.vertices)
    except QhullError:
        return _infeasible_step(
            "⚠ Evaluasi dihentikan: Titik-titik layak yang ditemukan bersifat kolinear "
            "(berada pada satu garis lurus) sehingga tidak membentuk daerah layak (polygon). "
            "Periksa kombinasi nilai stok bahan baku."
        )

    ordered_pts = [unique_pts[i] for i in hull_order]

    # Labeling ulang A, B, C, ...
    for idx, p in enumerate(ordered_pts):
        p["label"] = chr(65 + idx)

    polygon_coords = [{"x": round(p["x1"], 6), "y": round(p["x2"], 6)} for p in ordered_pts]
    corner_labels = ", ".join([f"{p['label']}({_fmt(p['x1'])}, {_fmt(p['x2'])})" for p in ordered_pts])

    _add(
        narasi=(
            "LANGKAH 3 — Menentukan Daerah Layak (Feasible Region)\n\n"
            f"Titik-titik sudut yang memenuhi semua kendala:\n  {corner_labels}\n\n"
            "Titik-titik ini dihubungkan membentuk polygon Daerah Layak (diarsir pada grafik)."
        ),
        vis_type="shade_polygon",
        vis_data={
            "points": polygon_coords,
            "color": "rgba(255, 193, 7, 0.25)",
            "borderColor": "#FFC107",
        },
    )

    # ------------------------------------------------------------------
    # 5. Evaluasi Z di setiap corner point
    # ------------------------------------------------------------------
    _add(
        narasi=(
            "LANGKAH 4 — Evaluasi Nilai Z pada Setiap Titik Sudut\n\n"
            f"Z = {_fmt_rp(keuntungan_nastar)}·x₁ + {_fmt_rp(keuntungan_kastengel)}·x₂\n\n"
            "Menghitung nilai Z untuk masing-masing titik sudut..."
        ),
        vis_type="none",
    )

    z_values: list[float] = []
    eval_rows: list[str] = []

    for p in ordered_pts:
        z = keuntungan_nastar * p["x1"] + keuntungan_kastengel * p["x2"]
        z_values.append(z)
        row = (
            f"  Titik {p['label']} ({_fmt(p['x1'])}, {_fmt(p['x2'])}):\n"
            f"    Z = {_fmt_rp(keuntungan_nastar)} × {_fmt(p['x1'])} + "
            f"{_fmt_rp(keuntungan_kastengel)} × {_fmt(p['x2'])} = {_fmt_rp(z)}"
        )
        eval_rows.append(row)
        _add(
            narasi=row,
            vis_type="add_point",
            vis_data={
                "x": round(p["x1"], 6),
                "y": round(p["x2"], 6),
                "label": p["label"],
                "z_value": round(z, 2),
                "feasible": True,
            },
        )

    # ------------------------------------------------------------------
    # 6. Tentukan titik optimum
    # ------------------------------------------------------------------
    best_idx = int(np.argmax(z_values))
    best_pt = ordered_pts[best_idx]
    z_opt = z_values[best_idx]

    x1_opt = best_pt["x1"]
    x2_opt = best_pt["x2"]
    x1_floor = math.floor(x1_opt)
    x2_floor = math.floor(x2_opt)
    z_floor = keuntungan_nastar * x1_floor + keuntungan_kastengel * x2_floor

    _add(
        narasi=(
            "LANGKAH 5 — Menentukan Titik Optimum\n\n"
            f"Nilai Z terbesar ada pada Titik {best_pt['label']} ({_fmt(x1_opt)}, {_fmt(x2_opt)}).\n\n"
            f"  Z Optimal = {_fmt_rp(z_opt)}\n\n"
            "--- Pembulatan ke Bawah (Realistis Produksi) ---\n"
            f"  Nastar    : {_fmt(x1_opt)} → {x1_floor} toples\n"
            f"  Kastengel : {_fmt(x2_opt)} → {x2_floor} toples\n"
            f"  Z (floor) = {_fmt_rp(z_floor)}\n\n"
            "🎉 Selesai! Solusi optimal telah ditemukan."
        ),
        vis_type="highlight_optimum",
        vis_data={
            "x": round(x1_opt, 6),
            "y": round(x2_opt, 6),
            "label": best_pt["label"],
            "z_value": round(z_opt, 2),
        },
    )

    # ------------------------------------------------------------------
    # 7. Validasi internal dengan linprog (tidak masuk steps)
    # ------------------------------------------------------------------
    try:
        c_obj = [-keuntungan_nastar, -keuntungan_kastengel]
        A_ub = [[c["a1"], c["a2"]] for c in constraints]
        b_ub = [c["rhs"] for c in constraints]
        bounds = [(0, None), (0, None)]

        lp_res = linprog(c_obj, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method="highs")

        if lp_res.success:
            lp_z = -lp_res.fun
            diff = abs(lp_z - z_opt)
            if diff < 1.0:
                logger.info(
                    "[CHECKER] ✓ linprog memvalidasi hasil: Z = %s (selisih %.4f dari manual)",
                    _fmt_rp(lp_z), diff
                )
            else:
                logger.warning(
                    "[CHECKER] ⚠ Perbedaan antara manual (%.2f) dan linprog (%.2f): %.4f",
                    z_opt, lp_z, diff
                )
        else:
            logger.warning("[CHECKER] linprog melaporkan status: %s", lp_res.message)
    except Exception as e:
        logger.warning("[CHECKER] linprog error: %s", e)

    # ------------------------------------------------------------------
    # Hasil ringkasan
    # ------------------------------------------------------------------
    hasil = {
        "x1_nastar": round(x1_opt, 4),
        "x2_kastengel": round(x2_opt, 4),
        "x1_floor": x1_floor,
        "x2_floor": x2_floor,
        "z_optimal": round(z_opt, 2),
        "z_floor": round(z_floor, 2),
        "titik_optimum_label": best_pt["label"],
        "corner_points": [
            {
                "label": p["label"],
                "x1": round(p["x1"], 4),
                "x2": round(p["x2"], 4),
                "z": round(z_values[i], 2),
            }
            for i, p in enumerate(ordered_pts)
        ],
    }

    return "success", steps, hasil
