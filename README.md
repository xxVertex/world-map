# 🗺️ World Forge — Procedural Map Generator

A pixel art RPG-style procedural world map generator built with React + HTML5 Canvas. Generates unique fantasy worlds using layered Perlin noise with seeded randomness.

## Features

- 🌍 **Procedural terrain** — multi-octave fractal Brownian motion (fBm) for natural-looking landmasses
- 🏔️ **12 biomes** — Deep Ocean, Jungle, Desert, Tundra, Snowy Peaks, Savanna, and more
- 🌡️ **Climate simulation** — temperature (latitude + elevation), moisture layered independently
- 🏝️ **Island mask** — continents naturally form away from map edges
- 🌊 **Rivers** — flow downhill from mountains to the sea
- 🏞️ **Lakes** — form in inland lowland areas
- 🏰 **Cities & Towns** — placed near water and fertile biomes, with fantasy names
- 🎲 **Seeded generation** — enter any text seed for reproducible worlds
- 💾 **Export PNG** — download your map at full resolution
- 🖱️ **Tile inspector** — hover over any tile to see biome, elevation, moisture, temperature
- 📏 **3 map sizes** — Small (80×60), Medium (120×90), Large (160×120)
- 📺 **Pixel art rendering** — sprite trees, mountains, city icons drawn on Canvas

## Getting Started

```bash
git clone https://github.com/xxVertex/world-forge.git
cd world-forge
npm install
npm start
```

## Build

```bash
npm run build
```

## How It Works

1. **Elevation** — 7-octave fBm noise × island distance mask → landmass shape
2. **Moisture** — separate 5-octave fBm → wet/dry regions
3. **Temperature** — latitude gradient + elevation penalty + noise variation
4. **Biome** — elevation × moisture × temperature → Whittaker biome lookup
5. **Rivers** — start on mountainous tiles, flow toward lowest neighbor ± noise
6. **Settlement placement** — score candidate tiles by biome quality + proximity to water + spacing

## Project Structure

```
src/
├── utils/
│   ├── noise.js        # Seeded RNG, Perlin noise, fBm
│   ├── biomes.js       # Biome IDs, colors, classification function
│   ├── worldgen.js     # Terrain, rivers, lakes, settlements
│   └── mapRenderer.js  # Canvas pixel art rendering + PNG export
├── components/
│   ├── MapCanvas.jsx   # Canvas display + hover detection
│   ├── Legend.jsx      # Biome color legend
│   └── WorldStats.jsx  # World stats + settlement list
├── App.jsx             # Controls panel + layout
└── App.css             # Dark RPG UI design system
```

## License

MIT
