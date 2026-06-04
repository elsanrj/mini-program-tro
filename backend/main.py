"""
main.py
=======
FastAPI entry point untuk API Kalkulator Dapur Ibu.

Endpoint:
    POST /solve  →  Terima input bahan & parameter, kembalikan steps Metode Grafis
    GET  /health →  Health check
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import SolveRequest, SolveResponse
from solver import build_steps

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown log)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🍪 Kalkulator Dapur Ibu — Backend siap.")
    yield
    logger.info("Backend dimatikan.")


# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Kalkulator Dapur Ibu — API",
    description=(
        "Backend FastAPI untuk menyelesaikan Linear Programming "
        "Optimasi Produksi Kue dengan Metode Grafis step-by-step."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — izinkan Next.js dev (3000) dan produksi
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Utility"])
async def health_check():
    """Cek apakah server berjalan."""
    return {"status": "ok", "service": "Kalkulator Dapur Ibu API"}


@app.post("/solve", response_model=SolveResponse, tags=["Solver"])
async def solve(req: SolveRequest) -> SolveResponse:
    """
    Terima input bahan baku & parameter, kembalikan array langkah-langkah
    penyelesaian Metode Grafis beserta instruksi visual untuk frontend.

    Status respons:
    - **success**    → titik optimum ditemukan
    - **infeasible** → daerah layak tidak terbentuk (stok terlalu kecil)
    - **error**      → input menyebabkan kalkulasi tidak valid
    """
    logger.info(
        "Menerima request /solve | tepung=%.0f mentega=%.0f telur=%.0f "
        "C1=%.0f C2=%.0f t1=%.1f t2=%.1f wL=%.1f",
        req.stok_tepung, req.stok_mentega, req.stok_telur,
        req.keuntungan_nastar, req.keuntungan_kastengel,
        req.waktu_nastar, req.waktu_kastengel, req.waktu_luang,
    )

    try:
        status, steps, hasil = build_steps(
            stok_tepung=req.stok_tepung,
            stok_mentega=req.stok_mentega,
            stok_telur=req.stok_telur,
            keuntungan_nastar=req.keuntungan_nastar,
            keuntungan_kastengel=req.keuntungan_kastengel,
            waktu_nastar=req.waktu_nastar,
            waktu_kastengel=req.waktu_kastengel,
            waktu_luang=req.waktu_luang,
        )
    except Exception as exc:
        # Tangkap semua exception yang tidak terduga — jangan return 500
        logger.exception("Unexpected error di build_steps: %s", exc)
        return SolveResponse(
            status="error",
            steps=[],
            hasil=None,
        )

    logger.info("Selesai | status=%s | jumlah_steps=%d", status, len(steps))

    return SolveResponse(status=status, steps=steps, hasil=hasil)
