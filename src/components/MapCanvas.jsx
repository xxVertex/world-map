import { useEffect, useRef, useCallback } from "react";
import { renderMap } from "../utils/mapRenderer";
import { BIOME_NAMES } from "../utils/biomes";

const TILE = 7;

export default function MapCanvas({ world, showGrid, onHover }) {
  const canvasRef   = useRef(null);
  const offscreenRef = useRef(null);

  // Re-render whenever world changes
  useEffect(() => {
    if (!world) return;
    const offscreen = document.createElement("canvas");
    offscreenRef.current = offscreen;
    renderMap(offscreen, world, TILE, showGrid);

    // Copy to visible canvas
    const canvas = canvasRef.current;
    canvas.width  = offscreen.width;
    canvas.height = offscreen.height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreen, 0, 0);
  }, [world, showGrid]);

  const handleMouseMove = useCallback((e) => {
    if (!world) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;
    const tx = Math.floor(mx / TILE);
    const ty = Math.floor(my / TILE);
    if (tx >= 0 && ty >= 0 && tx < world.cols && ty < world.rows) {
      const i = ty * world.cols + tx;
      onHover && onHover({
        x: tx, y: ty,
        biome: BIOME_NAMES[world.biomes[i]] || "Unknown",
        elevation: world.elevation[i],
        moisture: world.moisture[i],
        temperature: world.temperature[i],
      });
    }
  }, [world, onHover]);

  return (
    <div className="map-container">
      <canvas
        ref={canvasRef}
        className="map-canvas"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => onHover && onHover(null)}
      />
      {!world && (
        <div className="map-placeholder">
          <div className="map-placeholder__icon">🗺️</div>
          <p>Generate a world to begin</p>
        </div>
      )}
    </div>
  );
}
