'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ─── Types ────────────────────────────────────────────────────────────────────

interface VisualInstruction {
  type: 'add_line' | 'add_point' | 'shade_polygon' | 'highlight_optimum' | 'none' | 'error';
  data?: any;
}

interface SolutionStep {
  step_id: number;
  narasi: string;
  visual: VisualInstruction;
}

interface SolveResponse {
  status: 'success' | 'infeasible' | 'error';
  steps: SolutionStep[];
  hasil?: {
    x1_nastar: number;
    x2_kastengel: number;
    x1_floor: number;
    x2_floor: number;
    z_optimal: number;
    z_floor: number;
    titik_optimum_label: string;
    corner_points: { label: string; x1: number; x2: number; z: number }[];
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const API_URL = 'http://localhost:8000';

const DEFAULT_ADVANCED = {
  keuntungan_nastar: 50000,
  keuntungan_kastengel: 60000,
  waktu_nastar: 2,
  waktu_kastengel: 1,
  waktu_luang: 12,
};

const LINE_COLORS = ['#8B4513', '#C8860A', '#2E7D32', '#1565C0'];

// ─── Helper ──────────────────────────────────────────────────────────────────

function fmtRp(v: number) {
  return 'Rp ' + Math.round(v).toLocaleString('id-ID');
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InputField({
  label, unit, value, onChange, min = 0,
}: {
  label: string; unit: string; value: number; onChange: (v: number) => void; min?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label style={{ color: 'var(--brown-mid)', fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <div className="flex items-center" style={{ border: '1.5px solid var(--brown-light)', borderRadius: 8, background: 'white', overflow: 'hidden' }}>
        <input
          type="number"
          min={min}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            flex: 1, padding: '10px 12px', border: 'none', outline: 'none',
            fontFamily: "'Lato', sans-serif", fontSize: 15, color: 'var(--brown-deep)',
            background: 'transparent',
          }}
        />
        <span style={{
          padding: '0 12px', background: 'var(--cream-dark)',
          color: 'var(--brown-mid)', fontSize: 12, fontWeight: 700,
          borderLeft: '1.5px solid var(--brown-light)', height: '100%',
          display: 'flex', alignItems: 'center',
        }}>{unit}</span>
      </div>
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) setHeight(contentRef.current.scrollHeight);
  }, [children]);

  return (
    <div style={{ border: '1.5px solid var(--cream-dark)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', background: 'var(--cream-dark)', border: 'none', cursor: 'pointer',
          fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13,
          color: 'var(--brown-mid)', letterSpacing: '0.05em', textTransform: 'uppercase',
        }}
      >
        <span>⚙️ {title}</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▾</span>
      </button>
      <div
        className="accordion-content"
        style={{ maxHeight: open ? height + 'px' : '0px', opacity: open ? 1 : 0 }}
      >
        <div ref={contentRef} style={{ padding: '16px', background: 'white' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Chart Component ─────────────────────────────────────────────────────────

function GraphVisualizer({ visibleSteps }: { visibleSteps: SolutionStep[] }) {
  const chartDatasets: any[] = [];

  // Compute axis max from lines
  let axisMax = 15;
  visibleSteps.forEach(step => {
    if (step.visual.type === 'add_line' && step.visual.data?.points) {
      step.visual.data.points.forEach((p: any) => {
        axisMax = Math.max(axisMax, p.x * 1.25, p.y * 1.25);
      });
    }
  });
  axisMax = Math.ceil(axisMax);

  // Lines
  visibleSteps.forEach((step, idx) => {
    if (step.visual.type === 'add_line') {
      const d = step.visual.data;
      chartDatasets.push({
        label: d.label,
        data: d.points.map((p: any) => ({ x: p.x, y: p.y })),
        type: 'line',
        borderColor: d.color || LINE_COLORS[idx % LINE_COLORS.length],
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 3,
        pointBackgroundColor: d.color,
        fill: false,
        tension: 0,
        showLine: true,
      });
    }
  });

  // Feasible region polygon
  const polygonStep = visibleSteps.find(s => s.visual.type === 'shade_polygon');
  if (polygonStep?.visual.data) {
    const pts = polygonStep.visual.data.points;
    const closed = [...pts, pts[0]];
    chartDatasets.push({
      label: 'Daerah Layak',
      data: closed.map((p: any) => ({ x: p.x, y: p.y })),
      type: 'line',
      borderColor: 'rgba(200, 134, 10, 0.6)',
      backgroundColor: 'rgba(245, 200, 66, 0.18)',
      borderWidth: 1.5,
      fill: true,
      pointRadius: 0,
      tension: 0,
      showLine: true,
    });
  }

  // Corner points & evaluated points
  const pointSteps = visibleSteps.filter(s => s.visual.type === 'add_point');
  if (pointSteps.length > 0) {
    chartDatasets.push({
      label: 'Titik Sudut',
      data: pointSteps.map(s => ({ x: s.visual.data.x, y: s.visual.data.y })),
      type: 'scatter',
      pointBackgroundColor: 'var(--gold)',
      pointBorderColor: 'var(--brown-deep)',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    });
  }

  // Optimum highlight
  const optStep = visibleSteps.find(s => s.visual.type === 'highlight_optimum');
  if (optStep?.visual.data) {
    chartDatasets.push({
      label: `Titik Optimum ${optStep.visual.data.label}`,
      data: [{ x: optStep.visual.data.x, y: optStep.visual.data.y }],
      type: 'scatter',
      pointBackgroundColor: '#E53E3E',
      pointBorderColor: '#fff',
      pointBorderWidth: 3,
      pointRadius: 12,
      pointHoverRadius: 14,
    });
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 400, easing: 'easeOutQuart' },
    scales: {
      x: {
        type: 'linear', min: 0, max: axisMax,
        title: { display: true, text: 'x₁ (Nastar, toples)', color: '#7B3F00', font: { size: 12, weight: 'bold' } },
        grid: { color: 'rgba(125,63,0,0.08)' },
        ticks: { color: '#7B3F00' },
      },
      y: {
        type: 'linear', min: 0, max: axisMax,
        title: { display: true, text: 'x₂ (Kastengel, toples)', color: '#7B3F00', font: { size: 12, weight: 'bold' } },
        grid: { color: 'rgba(125,63,0,0.08)' },
        ticks: { color: '#7B3F00' },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#3D1C02', font: { size: 11 }, boxWidth: 14, padding: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const pt = ctx.raw;
            return ` (${Number(pt.x).toFixed(2)}, ${Number(pt.y).toFixed(2)})`;
          },
        },
      },
    },
  };

  if (chartDatasets.length === 0) {
    return (
      <div style={{
        height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px dashed var(--cream-dark)', borderRadius: 12,
        color: 'var(--brown-light)', fontFamily: "'Lato', sans-serif", fontSize: 14,
        flexDirection: 'column', gap: 8,
      }}>
        <span style={{ fontSize: 40 }}>📊</span>
        <span>Grafik akan muncul di sini</span>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '16px', border: '1.5px solid var(--cream-dark)' }}>
      <Scatter data={{ datasets: chartDatasets }} options={options} />
    </div>
  );
}

// ─── Corner Point Table ───────────────────────────────────────────────────────

function CornerTable({ hasil }: { hasil: NonNullable<SolveResponse['hasil']> }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Lato', sans-serif", fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--cream-dark)' }}>
            {['Titik', 'x₁ (Nastar)', 'x₂ (Kastengel)', 'Nilai Z', ''].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--brown-mid)', fontWeight: 700, borderBottom: '2px solid var(--cream-dark)', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hasil.corner_points.map(cp => {
            const isOpt = cp.label === hasil.titik_optimum_label;
            return (
              <tr key={cp.label} style={{ background: isOpt ? 'rgba(245,200,66,0.15)' : 'white', borderBottom: '1px solid var(--cream-dark)' }}>
                <td style={{ padding: '7px 12px', fontWeight: 700, color: isOpt ? 'var(--gold)' : 'var(--brown-deep)' }}>{cp.label}</td>
                <td style={{ padding: '7px 12px' }}>{cp.x1.toFixed(4)}</td>
                <td style={{ padding: '7px 12px' }}>{cp.x2.toFixed(4)}</td>
                <td style={{ padding: '7px 12px', fontWeight: isOpt ? 700 : 400, color: isOpt ? 'var(--gold)' : 'inherit' }}>{fmtRp(cp.z)}</td>
                <td style={{ padding: '7px 12px' }}>{isOpt && <span style={{ background: 'var(--gold)', color: 'white', borderRadius: 4, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>OPTIMAL</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  // Form state
  const [stokTepung, setStokTepung] = useState(2000);
  const [stokMentega, setStokMentega] = useState(1500);
  const [stokTelur, setStokTelur] = useState(20);
  const [adv, setAdv] = useState({ ...DEFAULT_ADVANCED });

  // Result state
  const [allSteps, setAllSteps] = useState<SolutionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasil, setHasil] = useState<SolveResponse['hasil']>(undefined);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');

  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [currentStep]);

  const visibleSteps = allSteps.slice(0, currentStep);
  const canAdvance = currentStep < allSteps.length;
  const isDone = allSteps.length > 0 && currentStep >= allSteps.length;

  const handleSolve = useCallback(async () => {
    setError('');
    setLoading(true);
    setShowResult(false);
    setAllSteps([]);
    setCurrentStep(0);
    setHasil(undefined);

    try {
      const res = await fetch(`${API_URL}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stok_tepung: stokTepung,
          stok_mentega: stokMentega,
          stok_telur: stokTelur,
          keuntungan_nastar: adv.keuntungan_nastar,
          keuntungan_kastengel: adv.keuntungan_kastengel,
          waktu_nastar: adv.waktu_nastar,
          waktu_kastengel: adv.waktu_kastengel,
          waktu_luang: adv.waktu_luang,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: SolveResponse = await res.json();

      setAllSteps(data.steps);
      setStatus(data.status);
      setHasil(data.hasil);
      setCurrentStep(1);
      setShowResult(true);
    } catch (e: any) {
      setError(e.message || 'Gagal terhubung ke server. Pastikan backend berjalan di port 8000.');
    } finally {
      setLoading(false);
    }
  }, [stokTepung, stokMentega, stokTelur, adv]);

  const handleNextStep = () => {
    if (canAdvance) setCurrentStep(s => s + 1);
  };

  const handleAutoPlay = () => {
    const interval = setInterval(() => {
      setCurrentStep(s => {
        if (s >= allSteps.length) { clearInterval(interval); return s; }
        return s + 1;
      });
    }, 600);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }} className="paper-texture">

      {/* ── Hero ── */}
      <header style={{
        background: `linear-gradient(135deg, var(--brown-deep) 0%, var(--brown-mid) 60%, var(--gold) 100%)`,
        padding: '48px 24px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(245,200,66,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ fontSize: 48, marginBottom: 12 }}>🍪</div>
        <h1 className="font-display" style={{ color: 'var(--butter)', fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 900, marginBottom: 10, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
          Kalkulator Dapur Ibu
        </h1>
        <p style={{ color: 'var(--butter-light)', fontSize: 15, maxWidth: 520, margin: '0 auto', lineHeight: 1.6, opacity: 0.9 }}>
          Optimasi produksi <strong>Nastar</strong> & <strong>Kastengel</strong> menggunakan{' '}
          <em>Linear Programming Metode Grafis</em> — visualisasi langkah per langkah.
        </p>
        <div style={{ marginTop: 16, display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Metode Grafis', 'Step-by-Step', 'Feasible Region', 'Corner Point Evaluation'].map(tag => (
            <span key={tag} style={{ background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.3)', color: 'var(--butter-light)', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>{tag}</span>
          ))}
        </div>
      </header>

      {/* ── Input Panel ── */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 0' }}>
        <div style={{
          background: 'white', borderRadius: 16, padding: '28px',
          boxShadow: '0 4px 24px var(--shadow-warm)',
          border: '1.5px solid var(--cream-dark)',
        }}>
          <h2 className="font-display" style={{ color: 'var(--brown-deep)', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            Stok Bahan Baku Hari Ini
          </h2>
          <p style={{ color: 'var(--brown-light)', fontSize: 13, marginBottom: 20 }}>
            Masukkan stok yang tersedia di dapur untuk memulai kalkulasi.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            <InputField label="Tepung Terigu" unit="gram" value={stokTepung} onChange={setStokTepung} min={1} />
            <InputField label="Mentega" unit="gram" value={stokMentega} onChange={setStokMentega} min={1} />
            <InputField label="Telur" unit="butir" value={stokTelur} onChange={setStokTelur} min={1} />
          </div>

          <div style={{ marginTop: 20 }}>
            <Accordion title="Pengaturan Lanjutan">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <InputField label="Untung Nastar/toples" unit="Rp" value={adv.keuntungan_nastar} onChange={v => setAdv(a => ({ ...a, keuntungan_nastar: v }))} min={1} />
                <InputField label="Untung Kastengel/toples" unit="Rp" value={adv.keuntungan_kastengel} onChange={v => setAdv(a => ({ ...a, keuntungan_kastengel: v }))} min={1} />
                <InputField label="Waktu Buat Nastar" unit="jam" value={adv.waktu_nastar} onChange={v => setAdv(a => ({ ...a, waktu_nastar: v }))} min={0.1} />
                <InputField label="Waktu Buat Kastengel" unit="jam" value={adv.waktu_kastengel} onChange={v => setAdv(a => ({ ...a, waktu_kastengel: v }))} min={0.1} />
                <InputField label="Waktu Luang Ibu" unit="jam" value={adv.waktu_luang} onChange={v => setAdv(a => ({ ...a, waktu_luang: v }))} min={1} />
              </div>
              <p style={{ marginTop: 10, fontSize: 11, color: 'var(--brown-light)' }}>
                ℹ️ Nilai di atas sudah terisi bawaan. Refresh halaman untuk mereset.
              </p>
            </Accordion>
          </div>

          {error && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#FFF5F5', border: '1.5px solid #FC8181', borderRadius: 8, color: '#C53030', fontSize: 13, fontFamily: "'Lato', sans-serif" }}>
              ⚠ {error}
            </div>
          )}

          <button
            onClick={handleSolve}
            disabled={loading}
            style={{
              marginTop: 22, width: '100%', padding: '14px',
              background: loading ? 'var(--brown-light)' : `linear-gradient(135deg, var(--brown-mid), var(--gold))`,
              color: 'white', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700,
              letterSpacing: '0.02em',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(125,63,0,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '⏳ Menghitung...' : '🧮 Hitung Keuntungan Maksimal!'}
          </button>
        </div>
      </section>

      {/* ── Visualizer (Split Screen) ── */}
      {showResult && (
        <section className="fade-in-up" style={{ maxWidth: 1200, margin: '32px auto 0', padding: '0 20px' }}>

          {/* Step control bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 10, marginBottom: 16,
            padding: '12px 20px', background: 'white',
            borderRadius: 12, border: '1.5px solid var(--cream-dark)',
            boxShadow: '0 2px 8px var(--shadow-warm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                background: 'var(--gold)', color: 'white',
                borderRadius: 8, padding: '4px 14px',
                fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 700,
              }}>
                Langkah {Math.min(currentStep, allSteps.length)} / {allSteps.length}
              </div>
              {isDone && status === 'success' && (
                <span style={{ color: '#276749', fontSize: 13, fontWeight: 700 }}>✓ Selesai</span>
              )}
              {isDone && status !== 'success' && (
                <span style={{ color: '#C53030', fontSize: 13, fontWeight: 700 }}>⚠ {status}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {!isDone && (
                <>
                  <button onClick={handleNextStep} disabled={!canAdvance} style={btnStyle('primary')}>
                    Langkah Selanjutnya →
                  </button>
                  <button onClick={handleAutoPlay} style={btnStyle('secondary')}>
                    ▶ Auto Play
                  </button>
                </>
              )}
              {isDone && (
                <button onClick={() => { setShowResult(false); setAllSteps([]); setCurrentStep(0); }} style={btnStyle('secondary')}>
                  ↺ Reset
                </button>
              )}
            </div>
          </div>

          {/* Split screen */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr)', gap: 16, alignItems: 'start' }}>

            {/* Left: Terminal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div
                ref={terminalRef}
                className="terminal-scroll"
                style={{
                  background: 'var(--terminal-bg)',
                  borderRadius: '12px 12px 0 0',
                  padding: '20px',
                  height: 420,
                  overflowY: 'auto',
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: 12.5,
                  lineHeight: 1.75,
                  color: 'var(--terminal-text)',
                  border: '1.5px solid rgba(200,134,10,0.3)',
                  borderBottom: 'none',
                }}
              >
                <div style={{ color: 'var(--terminal-accent)', marginBottom: 12, fontSize: 11, opacity: 0.7 }}>
                  ┌─ KALKULATOR DAPUR IBU — METODE GRAFIS ────────────────┐
                </div>
                {visibleSteps.map((step, i) => {
                  const isLast = i === visibleSteps.length - 1;
                  const isError = step.visual.type === 'error';
                  return (
                    <div key={step.step_id} style={{ marginBottom: 10 }}>
                      <span style={{ color: 'var(--terminal-dim)', fontSize: 10 }}>
                        [{String(step.step_id).padStart(2, '0')}]
                      </span>{' '}
                      <span style={{
                        color: isError ? '#FC8181' : isLast ? 'var(--terminal-text)' : 'var(--terminal-dim)',
                        whiteSpace: 'pre-wrap',
                      }}>
                        {step.narasi}
                        {isLast && !isDone && <span className="cursor-blink" />}
                      </span>
                    </div>
                  );
                })}
                {isDone && (
                  <div style={{ marginTop: 8, color: 'var(--terminal-green)', fontWeight: 700 }}>
                    {status === 'success' ? '█ SELESAI — Titik optimum berhasil ditemukan.' : '█ SELESAI — Proses dihentikan.'}
                  </div>
                )}
              </div>
              {/* bottom bar terminal */}
              <div style={{
                background: '#1A0D05', borderRadius: '0 0 12px 12px',
                padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8,
                border: '1.5px solid rgba(200,134,10,0.3)', borderTop: 'none',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: canAdvance && !isDone ? 'var(--terminal-accent)' : '#4A4A4A', display: 'inline-block' }} />
                <span style={{ color: 'var(--terminal-dim)', fontFamily: 'monospace', fontSize: 11 }}>
                  {isDone ? 'DONE' : `STEP ${currentStep}/${allSteps.length}`}
                </span>
              </div>
            </div>

            {/* Right: Chart */}
            <div>
              <GraphVisualizer visibleSteps={visibleSteps} />
            </div>
          </div>

          {/* ── Result Summary ── */}
          {isDone && status === 'success' && hasil && (
            <div className="fade-in-up" style={{ marginTop: 24 }}>

              {/* Big metric */}
              <div style={{
                background: `linear-gradient(135deg, var(--brown-deep), var(--brown-mid))`,
                borderRadius: 16, padding: '28px 32px',
                display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center',
                boxShadow: '0 8px 32px rgba(61,28,2,0.25)',
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--butter-light)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                    Estimasi Keuntungan Maksimal
                  </p>
                  <p className="font-display" style={{ color: 'var(--butter)', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, lineHeight: 1 }}>
                    {fmtRp(hasil.z_optimal)}
                  </p>
                  <p style={{ color: 'rgba(245,200,66,0.6)', fontSize: 12, marginTop: 6 }}>
                    Floor produksi: {fmtRp(hasil.z_floor)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {[
                    { emoji: '🫙', label: 'Nastar', exact: hasil.x1_nastar, floor: hasil.x1_floor, color: 'var(--butter)' },
                    { emoji: '🧀', label: 'Kastengel', exact: hasil.x2_kastengel, floor: hasil.x2_floor, color: 'var(--gold-light)' },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px',
                      textAlign: 'center', minWidth: 120,
                      border: '1.5px solid rgba(245,200,66,0.2)',
                    }}>
                      <div style={{ fontSize: 28 }}>{item.emoji}</div>
                      <div style={{ color: item.color, fontSize: 28, fontFamily: "'Playfair Display', serif", fontWeight: 900, lineHeight: 1.1 }}>
                        {item.floor}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>toples</div>
                      <div style={{ color: item.label === 'Nastar' ? 'var(--butter)' : 'var(--gold-light)', fontSize: 12, fontWeight: 700 }}>
                        {item.label}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 2 }}>
                        eksak: {item.exact.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Corner points table */}
              <div style={{ marginTop: 20, background: 'white', borderRadius: 12, padding: '20px', border: '1.5px solid var(--cream-dark)', boxShadow: '0 2px 8px var(--shadow-warm)' }}>
                <h3 className="font-display" style={{ color: 'var(--brown-deep)', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                  Evaluasi Semua Titik Sudut (Corner Points)
                </h3>
                <CornerTable hasil={hasil} />
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Footer ── */}
      <footer style={{ textAlign: 'center', padding: '40px 20px', marginTop: 40, color: 'var(--brown-light)', fontSize: 12 }}>
        <p className="font-display" style={{ fontSize: 14, color: 'var(--brown-mid)', marginBottom: 4 }}>Kalkulator Dapur Ibu</p>
        <p>Proyek Akhir Teknik Riset Operasi · Linear Programming Metode Grafis</p>
      </footer>
    </main>
  );
}

// ─── Button style helper ──────────────────────────────────────────────────────

function btnStyle(variant: 'primary' | 'secondary'): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '8px 16px', border: 'none', borderRadius: 8, cursor: 'pointer',
    fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 700,
    transition: 'all 0.15s',
  };
  if (variant === 'primary') return {
    ...base,
    background: 'linear-gradient(135deg, var(--brown-mid), var(--gold))',
    color: 'white', boxShadow: '0 2px 8px rgba(125,63,0,0.25)',
  };
  return {
    ...base,
    background: 'var(--cream-dark)',
    color: 'var(--brown-mid)',
    border: '1.5px solid var(--cream-dark)',
  };
}
