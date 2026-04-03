import { useState, useCallback, useRef } from "react";
import { generateWorld } from "./utils/worldgen";
import { exportPNG } from "./utils/mapRenderer";
import MapCanvas from "./components/MapCanvas";
import Legend from "./components/Legend";
import WorldStats from "./components/WorldStats";
import "./App.css";

const SIZES = [
  { label: "Small",  cols: 80,  rows: 60  },
  { label: "Medium", cols: 120, rows: 90  },
  { label: "Large",  cols: 160, rows: 120 },
];

function randomSeed() {
  return Math.floor(Math.random() * 999999).toString();
}

export default function App() {
  const [world, setWorld]       = useState(null);
  const [seedInput, setSeedInput] = useState(randomSeed());
  const [sizeIdx, setSizeIdx]   = useState(1);
  const [generating, setGenerating] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [hovered, setHovered]   = useState(null);
  const [tab, setTab]           = useState("stats"); // stats | legend
  const canvasRef               = useRef(null);

  const generate = useCallback((seed) => {
    setGenerating(true);
    const s = seed ?? seedInput;
    // Defer to allow UI to update
    setTimeout(() => {
      const { cols, rows } = SIZES[sizeIdx];
      const w = generateWorld(s, cols, rows);
      setWorld(w);
      setGenerating(false);
    }, 20);
  }, [seedInput, sizeIdx]);

  function handleNew() {
    const s = randomSeed();
    setSeedInput(s);
    generate(s);
  }

  function handleExport() {
    const canvas = document.querySelector(".map-canvas");
    if (canvas) exportPNG(canvas, `world-${world?.seed || "map"}.png`);
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header__brand">
          <span className="header__rune">⚔</span>
          <div>
            <div className="header__title">WORLD FORGE</div>
            <div className="header__sub">Procedural Map Generator</div>
          </div>
        </div>
      </header>

      <div className="layout">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="panel">
            <div className="panel__title">⚙ GENERATION</div>

            <label className="field-label">SEED</label>
            <div className="seed-row">
              <input
                className="input"
                value={seedInput}
                onChange={e => setSeedInput(e.target.value)}
                placeholder="Enter seed or name…"
                onKeyDown={e => e.key === "Enter" && generate()}
              />
              <button className="icon-btn" title="Random seed" onClick={() => setSeedInput(randomSeed())}>🎲</button>
            </div>

            <label className="field-label">MAP SIZE</label>
            <div className="size-btns">
              {SIZES.map((s, i) => (
                <button
                  key={i}
                  className={`size-btn ${sizeIdx === i ? "size-btn--active" : ""}`}
                  onClick={() => setSizeIdx(i)}
                >
                  {s.label}
                  <span>{s.cols}×{s.rows}</span>
                </button>
              ))}
            </div>

            <label className="field-label">OPTIONS</label>
            <label className="checkbox-row">
              <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
              Show grid
            </label>

            <div className="btn-group">
              <button className="btn btn--primary" onClick={() => generate()} disabled={generating}>
                {generating ? "⏳ Generating…" : "⚡ Generate"}
              </button>
              <button className="btn btn--secondary" onClick={handleNew} disabled={generating}>
                🎲 Random
              </button>
              <button className="btn btn--ghost" onClick={handleExport} disabled={!world}>
                💾 Export PNG
              </button>
            </div>
          </div>

          {/* Hover info */}
          <div className={`hover-info ${hovered ? "hover-info--visible" : ""}`}>
            {hovered && <>
              <div className="hover-info__biome">{hovered.biome}</div>
              <div className="hover-info__stats">
                <span>Elev: {(hovered.elevation * 100).toFixed(0)}%</span>
                <span>Moist: {(hovered.moisture * 100).toFixed(0)}%</span>
                <span>Temp: {(hovered.temperature * 100).toFixed(0)}%</span>
              </div>
              <div className="hover-info__coords">({hovered.x}, {hovered.y})</div>
            </>}
            {!hovered && <span className="hover-info__idle">Hover over map to inspect</span>}
          </div>

          {/* Tab panel */}
          <div className="panel panel--grow">
            <div className="tabs">
              <button className={`tab ${tab==="stats"?"tab--active":""}`} onClick={()=>setTab("stats")}>Stats</button>
              <button className={`tab ${tab==="legend"?"tab--active":""}`} onClick={()=>setTab("legend")}>Legend</button>
            </div>
            {tab === "stats"  && <WorldStats world={world} />}
            {tab === "legend" && <Legend />}
          </div>
        </aside>

        {/* ── Map area ── */}
        <main className="map-area">
          {generating && (
            <div className="generating-overlay">
              <div className="generating-overlay__inner">
                <div className="spinner">⚙</div>
                <p>Forging world…</p>
              </div>
            </div>
          )}
          <MapCanvas world={world} showGrid={showGrid} onHover={setHovered} />
        </main>
      </div>
    </div>
  );
}
