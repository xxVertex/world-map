import { BIOME, BIOME_NAMES, BIOME_COLORS } from "../utils/biomes";

const LEGEND_ITEMS = [
  BIOME.DEEP_OCEAN, BIOME.OCEAN, BIOME.SHALLOW, BIOME.BEACH,
  BIOME.GRASSLAND, BIOME.FOREST, BIOME.DENSE_FOREST, BIOME.JUNGLE,
  BIOME.DESERT, BIOME.SAVANNA, BIOME.TUNDRA, BIOME.SNOW,
  BIOME.MOUNTAIN, BIOME.HIGH_MOUNTAIN, BIOME.PEAK,
  BIOME.RIVER, BIOME.LAKE,
];

export default function Legend() {
  return (
    <div className="legend">
      <div className="legend__title">⬛ BIOMES</div>
      <div className="legend__grid">
        {LEGEND_ITEMS.map(id => (
          <div key={id} className="legend__item">
            <div
              className="legend__swatch"
              style={{ background: BIOME_COLORS[id]?.[0] || "#888" }}
            />
            <span>{BIOME_NAMES[id]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
