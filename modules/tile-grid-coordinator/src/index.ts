export const TILE_W = 32;
export const TILE_H = 32;

/** Convert grid (tile) coordinates to screen (pixel) coordinates. */
export function tileToScreen(tileX: number, tileY: number, offsetX: number = 0, offsetY: number = 0) {
  return {
    x: tileX * TILE_W + offsetX,
    y: tileY * TILE_H + offsetY,
  };
}

/** Convert screen (pixel) coordinates to grid (tile) coordinates. */
export function screenToTile(screenX: number, screenY: number, offsetX: number = 0, offsetY: number = 0) {
  return {
    tileX: Math.floor((screenX - offsetX) / TILE_W),
    tileY: Math.floor((screenY - offsetY) / TILE_H),
  };
}

/** Get the center point of a tile in screen coordinates. */
export function tileCenterScreen(tileX: number, tileY: number, offsetX: number = 0, offsetY: number = 0) {
  const pos = tileToScreen(tileX, tileY, offsetX, offsetY);
  return {
    x: pos.x + TILE_W / 2,
    y: pos.y + TILE_H / 2,
  };
}

/** Check if a tile coordinate is within grid bounds. */
export function isInBounds(tileX: number, tileY: number, gridWidth: number, gridHeight: number): boolean {
  return tileX >= 0 && tileX < gridWidth && tileY >= 0 && tileY < gridHeight;
}

/** Manhattan distance between two tiles. */
export function tileDistance(ax: number, ay: number, bx: number, by: number): number {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}
