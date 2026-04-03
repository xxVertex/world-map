import { createRNG, seedFromString, createNoise, fbm } from "./noise";
import { getBiome, BIOME } from "./biomes";

const WATER_BIOMES = new Set([BIOME.DEEP_OCEAN, BIOME.OCEAN, BIOME.SHALLOW]);
const LAND_BIOMES  = new Set([BIOME.BEACH, BIOME.GRASSLAND, BIOME.FOREST,
  BIOME.DENSE_FOREST, BIOME.JUNGLE, BIOME.DESERT, BIOME.SAVANNA,
  BIOME.TUNDRA, BIOME.SNOW, BIOME.MOUNTAIN, BIOME.HIGH_MOUNTAIN]);

const CITY_GOOD = new Set([BIOME.GRASSLAND, BIOME.FOREST, BIOME.SAVANNA, BIOME.BEACH]);
const TOWN_OK   = new Set([BIOME.TUNDRA, BIOME.DENSE_FOREST, BIOME.DESERT, BIOME.JUNGLE]);

export function generateWorld(seedInput, cols, rows) {
  const seed = typeof seedInput === "string" ? seedFromString(seedInput || String(Date.now())) : seedInput;
  const rng  = createRNG(seed);

  // Multiple noise layers
  const elevNoise  = createNoise(createRNG(rng() * 0xFFFFFFFF));
  const moistNoise = createNoise(createRNG(rng() * 0xFFFFFFFF));
  const tempNoise  = createNoise(createRNG(rng() * 0xFFFFFFFF));
  const detailNoise= createNoise(createRNG(rng() * 0xFFFFFFFF));

  const scale = 3.5;
  const mScale = 2.8;
  const tScale = 1.8;

  // Island mask — fade edges to ocean
  function islandMask(cx, cy) {
    const dx = (cx / cols - 0.5) * 2;
    const dy = (cy / rows - 0.5) * 2;
    const d  = Math.sqrt(dx * dx + dy * dy);
    return Math.max(0, 1 - d * 1.2);
  }

  // Build elevation / moisture / temperature grids
  const elevation  = new Float32Array(cols * rows);
  const moisture   = new Float32Array(cols * rows);
  const temperature= new Float32Array(cols * rows);
  const detail     = new Float32Array(cols * rows);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const nx = x / cols, ny = y / rows;

      let e = (fbm(elevNoise, nx * scale, ny * scale, 7, 0.5, 2.1) + 1) / 2;
      e = e * 0.7 + islandMask(x, y) * 0.3;
      // Clamp + slight power curve for more ocean
      e = Math.pow(Math.max(0, Math.min(1, e)), 1.1);

      elevation[i]   = e;
      moisture[i]    = Math.max(0, Math.min(1, (fbm(moistNoise, nx * mScale + 5, ny * mScale + 5, 5, 0.5, 2.0) + 1) / 2));
      // Temperature: hot at equator, cold at poles + elevation penalty
      const lat = Math.abs(ny - 0.5) * 2; // 0=equator, 1=pole
      temperature[i] = Math.max(0, Math.min(1,
        (1 - lat * 0.7) - (Math.max(0, e - 0.65)) * 0.6 +
        (fbm(tempNoise, nx * tScale, ny * tScale, 3, 0.5, 2) * 0.15)
      ));
      detail[i] = (fbm(detailNoise, nx * 12, ny * 12, 2, 0.5, 2) + 1) / 2;
    }
  }

  // Assign biomes
  const biomes = new Uint8Array(cols * rows);
  for (let i = 0; i < cols * rows; i++) {
    biomes[i] = getBiome(elevation[i], moisture[i], temperature[i]);
  }

  // ── Rivers ─────────────────────────────────
  const rivers = [];
  const riverSet = new Set();
  const numRivers = 6 + Math.floor(rng() * 6);

  for (let r = 0; r < numRivers * 3 && rivers.length < numRivers; r++) {
    // Start from mountain/highland areas
    const startX = Math.floor(rng() * cols);
    const startY = Math.floor(rng() * rows);
    const si = startY * cols + startX;
    if (elevation[si] < 0.62 || elevation[si] > 0.85) continue;

    const path = [];
    let cx = startX, cy = startY;
    const visited = new Set();

    for (let step = 0; step < 200; step++) {
      const idx = cy * cols + cx;
      if (visited.has(idx)) break;
      visited.add(idx);
      path.push([cx, cy]);
      if (WATER_BIOMES.has(biomes[idx])) break;

      // Flow downhill with slight randomness
      const neighbors = [
        [cx-1,cy],[cx+1,cy],[cx,cy-1],[cx,cy+1],
        [cx-1,cy-1],[cx+1,cy-1],[cx-1,cy+1],[cx+1,cy+1],
      ].filter(([nx,ny]) => nx>=0&&ny>=0&&nx<cols&&ny<rows);

      let best = null, bestE = elevation[idx] + 0.01;
      for (const [nx, ny] of neighbors) {
        const ni = ny * cols + nx;
        const e  = elevation[ni] + (rng() - 0.5) * 0.04;
        if (e < bestE) { bestE = e; best = [nx, ny]; }
      }
      if (!best) break;
      [cx, cy] = best;
    }

    if (path.length > 15) {
      rivers.push(path);
      path.forEach(([px, py]) => {
        const pi = py * cols + px;
        if (!WATER_BIOMES.has(biomes[pi])) {
          biomes[pi] = BIOME.RIVER;
          riverSet.add(pi);
        }
      });
    }
  }

  // ── Lakes ──────────────────────────────────
  const lakes = [];
  const numLakes = 3 + Math.floor(rng() * 4);
  for (let l = 0; l < numLakes * 4 && lakes.length < numLakes; l++) {
    const lx = 5 + Math.floor(rng() * (cols - 10));
    const ly = 5 + Math.floor(rng() * (rows - 10));
    const li = ly * cols + lx;
    if (elevation[li] < 0.48 || elevation[li] > 0.65) continue;
    if (WATER_BIOMES.has(biomes[li])) continue;

    const radius = 2 + Math.floor(rng() * 4);
    const lakeTiles = [];
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx*dx + dy*dy > radius*radius*1.2) continue;
        const tlx = lx + dx, tly = ly + dy;
        if (tlx < 0 || tly < 0 || tlx >= cols || tly >= rows) continue;
        const ti = tly * cols + tlx;
        if (!WATER_BIOMES.has(biomes[ti])) {
          biomes[ti] = BIOME.LAKE;
          lakeTiles.push([tlx, tly]);
        }
      }
    }
    if (lakeTiles.length > 4) lakes.push({ cx: lx, cy: ly, radius, tiles: lakeTiles });
  }

  // ── Cities & Towns ─────────────────────────
  const settlements = [];
  const minDist = 18;
  const attempts = 300;

  const cityNames = generateNames(rng, 30);
  let nameIdx = 0;

  for (let a = 0; a < attempts && settlements.length < 18; a++) {
    const sx = 4 + Math.floor(rng() * (cols - 8));
    const sy = 4 + Math.floor(rng() * (rows - 8));
    const si = sy * cols + sx;
    const bio = biomes[si];

    if (!CITY_GOOD.has(bio) && !TOWN_OK.has(bio)) continue;

    // Check minimum distance from other settlements
    const tooClose = settlements.some(s => {
      const dx = s.x - sx, dy = s.y - sy;
      return Math.sqrt(dx*dx + dy*dy) < minDist;
    });
    if (tooClose) continue;

    // Near water = prefer city
    let nearWater = false;
    for (let dy = -4; dy <= 4 && !nearWater; dy++) {
      for (let dx = -4; dx <= 4 && !nearWater; dx++) {
        const ni = (sy+dy)*cols+(sx+dx);
        if (ni >= 0 && ni < biomes.length && (WATER_BIOMES.has(biomes[ni]) || biomes[ni] === BIOME.RIVER)) {
          nearWater = true;
        }
      }
    }

    const isCity = CITY_GOOD.has(bio) && (nearWater || rng() < 0.35);
    settlements.push({
      x: sx, y: sy,
      name: cityNames[nameIdx++ % cityNames.length],
      type: isCity ? "city" : "town",
      biome: bio,
    });
  }

  return {
    cols, rows, seed,
    elevation, moisture, temperature, detail,
    biomes, rivers, lakes, settlements,
    riverSet,
  };
}

// Fantasy name generator
function generateNames(rng, count) {
  const prefixes = ["Al","Bri","Cal","Dor","El","Far","Gal","Hal","Ir","Kal","Lor","Mor","Nel","Or","Por","Qal","Rin","Sol","Tal","Ul","Val","Wyr","Xal","Yr","Zel"];
  const mids     = ["a","e","i","o","u","an","ar","en","er","ir","on","or","ul","in","ath","eth","oth","ast","est","ost"];
  const suffixes = ["dor","heim","wyn","fell","moor","vale","ford","burg","hold","keep","port","gate","haven","reach","mark","wood","mere","shire","stone","ward"];
  const names = new Set();
  while (names.size < count) {
    const p = prefixes[Math.floor(rng() * prefixes.length)];
    const m = rng() < 0.5 ? mids[Math.floor(rng() * mids.length)] : "";
    const s = suffixes[Math.floor(rng() * suffixes.length)];
    names.add(p + m + s);
  }
  return [...names];
}
