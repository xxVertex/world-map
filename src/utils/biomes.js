// ── Biome IDs ────────────────────────────────
export const BIOME = {
  DEEP_OCEAN:    0,
  OCEAN:         1,
  SHALLOW:       2,
  BEACH:         3,
  GRASSLAND:     4,
  FOREST:        5,
  DENSE_FOREST:  6,
  JUNGLE:        7,
  DESERT:        8,
  SAVANNA:       9,
  TUNDRA:        10,
  SNOW:          11,
  MOUNTAIN:      12,
  HIGH_MOUNTAIN: 13,
  PEAK:          14,
  RIVER:         15,
  LAKE:          16,
};

export const BIOME_NAMES = {
  [BIOME.DEEP_OCEAN]:    "Deep Ocean",
  [BIOME.OCEAN]:         "Ocean",
  [BIOME.SHALLOW]:       "Shallow Sea",
  [BIOME.BEACH]:         "Beach",
  [BIOME.GRASSLAND]:     "Grassland",
  [BIOME.FOREST]:        "Forest",
  [BIOME.DENSE_FOREST]:  "Dense Forest",
  [BIOME.JUNGLE]:        "Jungle",
  [BIOME.DESERT]:        "Desert",
  [BIOME.SAVANNA]:       "Savanna",
  [BIOME.TUNDRA]:        "Tundra",
  [BIOME.SNOW]:          "Snowfield",
  [BIOME.MOUNTAIN]:      "Mountains",
  [BIOME.HIGH_MOUNTAIN]: "High Mountains",
  [BIOME.PEAK]:          "Snowy Peak",
  [BIOME.RIVER]:         "River",
  [BIOME.LAKE]:          "Lake",
};

// Pixel color palette — NES/SNES inspired
export const BIOME_COLORS = {
  [BIOME.DEEP_OCEAN]:    ["#0a1628", "#0d1e35", "#081422"],
  [BIOME.OCEAN]:         ["#1a3a6b", "#1e4580", "#163260"],
  [BIOME.SHALLOW]:       ["#2a5fa8", "#3070c0", "#1e5090"],
  [BIOME.BEACH]:         ["#d4b483", "#e0c090", "#c8a870"],
  [BIOME.GRASSLAND]:     ["#4a8c3f", "#5aa048", "#3d7834"],
  [BIOME.FOREST]:        ["#2d6b28", "#357830", "#245522"],
  [BIOME.DENSE_FOREST]:  ["#1a4a18", "#204e1c", "#163814"],
  [BIOME.JUNGLE]:        ["#1e5c1a", "#246820", "#187016"],
  [BIOME.DESERT]:        ["#c8a040", "#d4ae50", "#b89030"],
  [BIOME.SAVANNA]:       ["#8a7030", "#9a8038", "#7a6028"],
  [BIOME.TUNDRA]:        ["#8090a0", "#90a0b0", "#707888"],
  [BIOME.SNOW]:          ["#c8d8e8", "#d8e8f4", "#b8c8d8"],
  [BIOME.MOUNTAIN]:      ["#606878", "#707888", "#505868"],
  [BIOME.HIGH_MOUNTAIN]: ["#808898", "#9098a8", "#707080"],
  [BIOME.PEAK]:          ["#d0d8e0", "#e0e8f0", "#c0c8d0"],
  [BIOME.RIVER]:         ["#3a7abf", "#4488d0", "#2a6aac"],
  [BIOME.LAKE]:          ["#2a5fa8", "#3070c0", "#1e5090"],
};

// Determine biome from elevation (0–1) + moisture (0–1) + temperature (0–1)
export function getBiome(elevation, moisture, temperature) {
  if (elevation < 0.25) return BIOME.DEEP_OCEAN;
  if (elevation < 0.35) return BIOME.OCEAN;
  if (elevation < 0.42) return BIOME.SHALLOW;
  if (elevation < 0.46) return BIOME.BEACH;

  if (elevation > 0.88) return BIOME.PEAK;
  if (elevation > 0.78) return BIOME.HIGH_MOUNTAIN;
  if (elevation > 0.68) return BIOME.MOUNTAIN;

  if (temperature < 0.2) {
    if (elevation > 0.60) return BIOME.SNOW;
    return BIOME.TUNDRA;
  }
  if (temperature < 0.35) {
    if (moisture > 0.5) return BIOME.FOREST;
    return BIOME.TUNDRA;
  }

  if (moisture < 0.2) {
    if (temperature > 0.7) return BIOME.DESERT;
    return BIOME.SAVANNA;
  }
  if (moisture < 0.4) {
    if (temperature > 0.65) return BIOME.SAVANNA;
    return BIOME.GRASSLAND;
  }
  if (moisture < 0.65) {
    return BIOME.FOREST;
  }
  if (moisture < 0.80) {
    return BIOME.DENSE_FOREST;
  }
  if (temperature > 0.65) return BIOME.JUNGLE;
  return BIOME.DENSE_FOREST;
}

// Pick a color variant for a tile (adds subtle variation)
export function getTileColor(biome, rngVal) {
  const colors = BIOME_COLORS[biome] || ["#888888"];
  return colors[Math.floor(rngVal * colors.length)];
}
