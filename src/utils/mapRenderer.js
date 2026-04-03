import { BIOME, BIOME_COLORS, getTileColor } from "./biomes";

const WATER = new Set([BIOME.DEEP_OCEAN, BIOME.OCEAN, BIOME.SHALLOW, BIOME.RIVER, BIOME.LAKE]);

export function renderMap(canvas, world, tileSize = 6, showGrid = false) {
  const { cols, rows, biomes, elevation, detail, rivers, settlements } = world;
  const W = cols * tileSize;
  const H = rows * tileSize;
  canvas.width  = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // ── Draw base tiles ───────────────────────
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const biome = biomes[i];
      const d = detail[i];

      // Pick colour variant
      const colors = BIOME_COLORS[biome] || ["#888"];
      const cidx = Math.floor(d * colors.length) % colors.length;
      ctx.fillStyle = colors[cidx];
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

      // Subtle dithering on borders (every other pixel in 2x2 pattern)
      if (tileSize >= 4 && d > 0.7) {
        ctx.fillStyle = colors[Math.min(cidx + 1, colors.length - 1)];
        ctx.fillRect(x * tileSize + tileSize - 1, y * tileSize, 1, 1);
        ctx.fillRect(x * tileSize, y * tileSize + tileSize - 1, 1, 1);
      }
    }
  }

  // ── Shore shading — darker pixel on water-facing edges ───
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      const i = y * cols + x;
      if (WATER.has(biomes[i])) continue;
      const below = biomes[(y+1)*cols+x];
      const right = biomes[y*cols+x+1];
      if (WATER.has(below) || WATER.has(right)) {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        if (WATER.has(below)) ctx.fillRect(x*tileSize, (y+1)*tileSize-1, tileSize, 1);
        if (WATER.has(right)) ctx.fillRect((x+1)*tileSize-1, y*tileSize, 1, tileSize);
      }
      // Highlight top/left edges facing water
      const above = biomes[(y-1)*cols+x];
      const left  = biomes[y*cols+x-1];
      if (WATER.has(above) || WATER.has(left)) {
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        if (WATER.has(above)) ctx.fillRect(x*tileSize, y*tileSize, tileSize, 1);
        if (WATER.has(left))  ctx.fillRect(x*tileSize, y*tileSize, 1, tileSize);
      }
    }
  }

  // ── Pixel sprite drawing helpers ──────────
  function drawPixels(grid, px, py, colorMap, scale = 1) {
    grid.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (!cell || !colorMap[cell]) return;
        ctx.fillStyle = colorMap[cell];
        ctx.fillRect(
          Math.floor(px + rx * scale),
          Math.floor(py + ry * scale),
          Math.ceil(scale), Math.ceil(scale)
        );
      });
    });
  }

  const S = Math.max(1, tileSize / 6); // sprite scale

  // ── Tree sprites ───────────────────────────
  const treeSprite = [
    [0,1,1,0],
    [1,1,1,1],
    [0,1,1,0],
    [0,0,1,0],
  ];
  const palmSprite = [
    [1,0,1,0,1],
    [0,1,1,1,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
  ];
  const snowTreeSprite = [
    [0,0,1,0,0],
    [0,1,1,1,0],
    [1,1,1,1,1],
    [0,0,1,0,0],
  ];

  // Draw decorative sprites on biome tiles
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      const i = y * cols + x;
      const biome = biomes[i];
      const d = detail[i];
      if (d < 0.72) continue; // sparse placement

      const px = x * tileSize + 1;
      const py = y * tileSize;

      if (biome === BIOME.FOREST || biome === BIOME.DENSE_FOREST) {
        drawPixels(treeSprite, px, py, { 1: "#1a4018" }, S);
      } else if (biome === BIOME.JUNGLE) {
        drawPixels(palmSprite, px - 1, py, { 1: "#0e3a0c" }, S);
      } else if (biome === BIOME.TUNDRA && d > 0.82) {
        drawPixels(snowTreeSprite, px, py, { 1: "#a0b8c8" }, S);
      } else if (biome === BIOME.MOUNTAIN) {
        // Mountain pixel peak
        ctx.fillStyle = "#505868";
        ctx.fillRect(px + tileSize/2 - 1, py, 2, 2);
        ctx.fillStyle = "#d0d8e0";
        ctx.fillRect(px + tileSize/2 - 1, py, 2, 1);
      } else if (biome === BIOME.HIGH_MOUNTAIN || biome === BIOME.PEAK) {
        ctx.fillStyle = "#e8f0f8";
        ctx.fillRect(px + tileSize/2 - 1, py, 2, 2);
      }
    }
  }

  // ── Settlements ────────────────────────────
  const citySprite = [
    [0,1,0,1,0],
    [1,1,1,1,1],
    [1,2,1,2,1],
    [1,1,1,1,1],
    [0,1,0,1,0],
  ];
  const townSprite = [
    [0,1,0],
    [1,1,1],
    [1,2,1],
  ];

  settlements.forEach(s => {
    const px = s.x * tileSize - (s.type === "city" ? 2 : 1);
    const py = s.y * tileSize - (s.type === "city" ? 2 : 1);
    const sc = Math.max(1, tileSize / 5);

    if (s.type === "city") {
      drawPixels(citySprite, px, py,
        { 1: "#e8d090", 2: "#1a1a1a" }, sc);
    } else {
      drawPixels(townSprite, px, py,
        { 1: "#d4b870", 2: "#1a1a1a" }, sc);
    }

    // Name label
    if (tileSize >= 5) {
      ctx.font = `bold ${Math.max(6, tileSize - 1)}px 'Press Start 2P', monospace`;
      ctx.textAlign = "center";
      const labelY = py + (s.type === "city" ? 22 : 16) * sc;

      // Text shadow
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillText(s.name, s.x * tileSize + 1, labelY + 1);
      ctx.fillStyle = s.type === "city" ? "#ffe080" : "#f0d090";
      ctx.fillText(s.name, s.x * tileSize, labelY);
    }
  });

  // ── Grid overlay ───────────────────────────
  if (showGrid) {
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * tileSize, 0);
      ctx.lineTo(x * tileSize, H);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * tileSize);
      ctx.lineTo(W, y * tileSize);
      ctx.stroke();
    }
  }

  // ── Vignette ───────────────────────────────
  const vg = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.85);
  vg.addColorStop(0, "transparent");
  vg.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}

export function exportPNG(canvas, filename = "world-map.png") {
  canvas.toBlob(blob => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  });
}
