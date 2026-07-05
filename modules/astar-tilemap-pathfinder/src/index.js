/**
 * A* Pathfinder for Tile-Based Maps
 *
 * Classic A* algorithm optimized for orthogonal tile grids (4 or 8 directions).
 * Returns shortest walkable path from start to goal tile, or empty array if no path exists.
 *
 * Usage:
 *   import { AStarPathfinder } from './index.js';
 *   const pf = new AStarPathfinder(tileMap, { diagonals: true, heuristic: 'manhattan' });
 *   const path = pf.findPath(startX, startY, goalX, goalY);
 *   if (path.length > 0) {
 *     // Move along path[0], path[1], ...
 *   }
 */

export class AStarPathfinder {
  constructor(tileMap, options = {}) {
    this.tileMap = tileMap; // Must have isWalkable(x, y) -> boolean
    this.diagonals = options.diagonals ?? false;
    this.heuristic = options.heuristic ?? 'manhattan';
    this.maxIterations = options.maxIterations ?? 10000;
  }

  findPath(startX, startY, goalX, goalY) {
    const openSet = [];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const keyOf = (x, y) => `${x},${y}`;
    const start = keyOf(startX, startY);
    const goal = keyOf(goalX, goalY);

    if (!this.tileMap.isWalkable(startX, startY) || !this.tileMap.isWalkable(goalX, goalY)) {
      return [];
    }

    gScore.set(start, 0);
    fScore.set(start, this._heuristic(startX, startY, goalX, goalY));
    openSet.push({ x: startX, y: startY, f: fScore.get(start) });

    let iterations = 0;
    while (openSet.length > 0 && iterations < this.maxIterations) {
      iterations++;

      // Find node with lowest fScore
      let current = openSet[0];
      let currentIdx = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < current.f) {
          current = openSet[i];
          currentIdx = i;
        }
      }

      if (current.x === goalX && current.y === goalY) {
        return this._reconstructPath(cameFrom, goal);
      }

      openSet.splice(currentIdx, 1);
      const currentKey = keyOf(current.x, current.y);
      const neighbors = this._getNeighbors(current.x, current.y);

      for (const [nx, ny] of neighbors) {
        const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;
        const nKey = keyOf(nx, ny);
        const nG = gScore.get(nKey) ?? Infinity;

        if (tentativeG < nG) {
          cameFrom.set(nKey, currentKey);
          gScore.set(nKey, tentativeG);
          const h = this._heuristic(nx, ny, goalX, goalY);
          const f = tentativeG + h;
          fScore.set(nKey, f);

          // Check if neighbor is already in openSet
          const inOpen = openSet.some(n => n.x === nx && n.y === ny);
          if (!inOpen) {
            openSet.push({ x: nx, y: ny, f });
          }
        }
      }
    }

    return []; // No path found
  }

  _getNeighbors(x, y) {
    const neighbors = [];
    const dirs = this.diagonals
      ? [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]]
      : [[1,0], [-1,0], [0,1], [0,-1]];

    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (this.tileMap.isWalkable(nx, ny)) {
        neighbors.push([nx, ny]);
      }
    }
    return neighbors;
  }

  _heuristic(x1, y1, x2, y2) {
    if (this.heuristic === 'euclidean') {
      const dx = x2 - x1, dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    }
    // Manhattan (default)
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
  }

  _reconstructPath(cameFrom, goal) {
    const path = [];
    let current = goal;
    while (cameFrom.has(current)) {
      const [x, y] = current.split(',').map(Number);
      path.unshift([x, y]);
      current = cameFrom.get(current);
    }
    const [sx, sy] = goal.split(',').map(Number);
    path.push([sx, sy]);
    return path;
  }
}
