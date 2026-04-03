import { BIOME, BIOME_NAMES } from "../utils/biomes";

const WATER = new Set([BIOME.DEEP_OCEAN, BIOME.OCEAN, BIOME.SHALLOW]);

export default function WorldStats({ world }) {
  if (!world) return null;

  const total = world.cols * world.rows;
  const landCount = Array.from(world.biomes).filter(b => !WATER.has(b)).length;
  const landPct = ((landCount / total) * 100).toFixed(1);
  const cities = world.settlements.filter(s => s.type === "city").length;
  const towns  = world.settlements.filter(s => s.type === "town").length;

  // Dominant biome (excluding water)
  const biomeCounts = {};
  for (const b of world.biomes) {
    if (!WATER.has(b)) biomeCounts[b] = (biomeCounts[b] || 0) + 1;
  }
  const dominant = Object.entries(biomeCounts).sort((a,b)=>b[1]-a[1])[0];
  const dominantName = dominant ? BIOME_NAMES[dominant[0]] : "—";

  return (
    <div className="stats">
      <div className="stats__title">📊 WORLD STATS</div>
      <div className="stats__grid">
        <div className="stat">
          <span className="stat__label">Seed</span>
          <span className="stat__value mono">{world.seed}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Size</span>
          <span className="stat__value">{world.cols}×{world.rows}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Land</span>
          <span className="stat__value">{landPct}%</span>
        </div>
        <div className="stat">
          <span className="stat__label">Rivers</span>
          <span className="stat__value">{world.rivers.length}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Lakes</span>
          <span className="stat__value">{world.lakes.length}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Cities</span>
          <span className="stat__value">{cities}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Towns</span>
          <span className="stat__value">{towns}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Dominant</span>
          <span className="stat__value">{dominantName}</span>
        </div>
      </div>

      <div className="stats__title" style={{marginTop:12}}>🏙️ SETTLEMENTS</div>
      <div className="settlement-list">
        {world.settlements.map((s, i) => (
          <div key={i} className="settlement-item">
            <span className="settlement-item__icon">{s.type === "city" ? "🏰" : "🏘️"}</span>
            <span className="settlement-item__name">{s.name}</span>
            <span className="settlement-item__type">{s.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
