from pydantic import BaseModel, Field
from typing import Any, Optional


# ---------------------------------------------------------------------------
# Request Schema
# ---------------------------------------------------------------------------

class SolveRequest(BaseModel):
    # === Input Utama: Stok Bahan Baku ===
    stok_tepung: float = Field(..., gt=0, description="Stok tepung dalam gram")
    stok_mentega: float = Field(..., gt=0, description="Stok mentega dalam gram")
    stok_telur: float = Field(..., gt=0, description="Stok telur dalam butir")

    # === Input Lanjutan: Fungsi Tujuan ===
    keuntungan_nastar: float = Field(
        default=50_000, gt=0, description="Keuntungan per toples Nastar (Rp)"
    )
    keuntungan_kastengel: float = Field(
        default=60_000, gt=0, description="Keuntungan per toples Kastengel (Rp)"
    )

    # === Input Lanjutan: Kendala Waktu ===
    waktu_nastar: float = Field(
        default=2.0, gt=0, description="Waktu pembuatan Nastar (jam/toples)"
    )
    waktu_kastengel: float = Field(
        default=1.0, gt=0, description="Waktu pembuatan Kastengel (jam/toples)"
    )
    waktu_luang: float = Field(
        default=12.0, gt=0, description="Total waktu luang Ibu (jam)"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "stok_tepung": 2000,
                "stok_mentega": 1500,
                "stok_telur": 20,
                "keuntungan_nastar": 50000,
                "keuntungan_kastengel": 60000,
                "waktu_nastar": 2,
                "waktu_kastengel": 1,
                "waktu_luang": 12,
            }
        }
    }


# ---------------------------------------------------------------------------
# Visual Instruction Schemas (bagian dari setiap Step)
# ---------------------------------------------------------------------------

class VisualInstruction(BaseModel):
    """
    Instruksi data visual untuk frontend.
    type dapat berupa: 'add_line' | 'add_point' | 'shade_polygon' |
                       'highlight_optimum' | 'none' | 'error'
    """
    type: str
    data: Optional[Any] = None


# ---------------------------------------------------------------------------
# Step Schema
# ---------------------------------------------------------------------------

class SolutionStep(BaseModel):
    step_id: int
    narasi: str
    visual: VisualInstruction


# ---------------------------------------------------------------------------
# Response Schema
# ---------------------------------------------------------------------------

class SolveResponse(BaseModel):
    status: str = Field(description="'success' atau 'infeasible' atau 'error'")
    steps: list[SolutionStep]

    # Ringkasan hasil (None jika infeasible/error)
    hasil: Optional[dict[str, Any]] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "success",
                "steps": [
                    {
                        "step_id": 1,
                        "narasi": "Menggambar garis Kendala Tepung ...",
                        "visual": {
                            "type": "add_line",
                            "data": {
                                "label": "Kendala Tepung",
                                "color": "#8B4513",
                                "points": [{"x": 8, "y": 0}, {"x": 0, "y": 10}],
                            },
                        },
                    }
                ],
                "hasil": {
                    "x1_nastar": 4.0,
                    "x2_kastengel": 3.0,
                    "x1_floor": 4,
                    "x2_floor": 3,
                    "z_optimal": 380000,
                    "z_floor": 380000,
                    "titik_optimum_label": "B",
                },
            }
        }
    }
