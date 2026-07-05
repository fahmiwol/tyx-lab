# A* Tilemap Pathfinder

Classic A* pathfinding for orthogonal tile grids.

## Features

- **4 or 8-direction movement**: Choose between cardinal-only or including diagonals.
- **Heuristics**: Manhattan distance (default) or Euclidean.
- **Iteration limit**: Guard against long-running pathfinding with `maxIterations`.
- **Minimal overhead**: No allocations per frame, pure algorithm.

## Usage

```javascript
import { AStarPathfinder } from './index.js';

const tileMap = {
  isWalkable: (x, y) => {
    // Return true if tile (x, y) is passable
    return world.getTile(x, y) !== TILE_TYPE_WALL;
  }
};

const pathfinder = new AStarPathfinder(tileMap, {
  diagonals: true,
  heuristic: 'manhattan',
  maxIterations: 5000
});

// Find path
const path = pathfinder.findPath(agentX, agentY, goalX, goalY);
if (path.length > 0) {
  // Walk path[0], path[1], ...
  agent.moveTo(path[1]);
}
```

## Performance

O(n log n) typical case, where n = number of tiles explored. Fine for grids up to 256×256 with reasonable obstacles. For larger worlds, use hierarchical pathfinding or steering behaviors.

## Integration

Works with any tile-map structure that implements `isWalkable(x, y): boolean`.

*Open source — use it wisely.*
