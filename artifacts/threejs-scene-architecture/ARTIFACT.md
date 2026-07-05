# Three.js Scene Architecture & Composition Pattern

**Problem:** Three.js scenes become hard to maintain: repeated geometry creation code, material management scattered across files, camera/lighting setup mixed with game logic, and no clear pattern for interactive zones.

**Solution:** Standardized helpers for common 3D objects (box, cylinder), material registry, grouped composition, and warp-zone abstraction for navigation hotspots.

## Core Pattern

### 1. Helper Functions: Box & Cylinder

Define at top of your Outdoor/Scene class:

```javascript
// src/world/Outdoor.js (or similar)

// Create a box (cuboid)
function box(w, h, d, material) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    material
  );
}

// Create a cylinder (can be used as pillar, tower, disc)
function cyl(radiusTop, radiusBottom, height, segments, material) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    material
  );
}

// Usage examples:
var pillar = cyl(0.5, 0.5, 4, 8, this.mat.concrete); // vertical pillar
var disc = cyl(2, 2, 0.1, 16, this.mat.wood);         // horizontal disc
var cone = cyl(1, 0, 2, 8, this.mat.steel);           // cone (top=0)
var tower = box(1, 3, 1, this.mat.brick);             // rectangular tower
```

### 2. Material Registry

Create materials once, reuse many times:

```javascript
class Outdoor {
  constructor(scene) {
    this.scene = scene;
    this.mat = {}; // Material registry
    this._buildMaterials();
    this._group = new THREE.Group(); // Container for all buildings
    this.scene.add(this._group);
  }

  _buildMaterials() {
    this.mat.concrete = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
    this.mat.wood = new THREE.MeshStandardMaterial({ color: 0xc19a6b, roughness: 0.6 });
    this.mat.brick = new THREE.MeshStandardMaterial({ color: 0xa0522d, roughness: 0.7 });
    this.mat.glass = new THREE.MeshStandardMaterial({ 
      color: 0x88ccff, 
      transparent: true, 
      opacity: 0.3,
      metalness: 1,
      roughness: 0.2
    });
    this.mat.steel = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 1, roughness: 0.3 });
    this.mat.neon = new THREE.MeshBasicMaterial({ color: 0xff00ff }); // Unlit for neon glow
  }
}
```

### 3. Building Composition Pattern

Each building is a function that returns a Group:

```javascript
_buildInnovationLab() {
  var group = new THREE.Group();
  group.position.set(5, 0, 5); // Position in world
  
  // Core tower
  var core = cyl(1, 1, 8, 16, this.mat.steel);
  group.add(core);
  
  // Spire (cone)
  var spire = cyl(0.5, 0, 2, 8, this.mat.neon);
  spire.position.y = 4; // Top of core
  group.add(spire);
  
  // Curtain wall (glass)
  var wall = box(2, 8, 0.1, this.mat.glass);
  wall.position.set(1.2, 0, 0);
  group.add(wall);
  
  // Blinking light (accessory)
  var light = new THREE.PointLight(0xff0000, 1, 20);
  light.position.y = 4.5;
  group.add(light);
  
  this._group.add(group);
  return group;
}
```

Call from constructor:

```javascript
this._buildInnovationLab();
this._buildAdmin();
this._buildPark();
// etc.
```

### 4. Warp Zone Registry

Define interactive hotspots for fast travel:

```javascript
class Outdoor {
  constructor(scene) {
    // ... init ...
    this._warps = []; // List of warp zones
    this._buildWarpZones();
  }

  _buildWarpZones() {
    this._warps.push({
      id: "innovation-lab",
      x: 5,
      z: 5,
      color: 0xff00ff,
      hexStr: "#ff00ff",
      phase: 0 // For animation
    });
    this._warps.push({
      id: "admin-portal",
      x: -5,
      z: -5,
      color: 0x00ffff,
      hexStr: "#00ffff",
      phase: 0
    });
    // ... more warps ...
  }

  getWarpZones() {
    return this._warps;
  }

  // Called from Game3D each frame to animate warp rings
  updateWarpPhases(deltaTime) {
    for (var i = 0; i < this._warps.length; i++) {
      this._warps[i].phase = (this._warps[i].phase + deltaTime * 2) % Math.PI * 2;
    }
  }
}
```

### 5. Building Info Panel

Store metadata for UI:

```javascript
// At top of Outdoor.js
var BUILDING_INFO = {
  'innovation-lab': {
    name: 'Innovation Lab',
    description: 'AI research & ideation',
    rooms: ['IL1', 'IL2', 'IL3']
  },
  'admin-portal': {
    name: 'Admin Portal',
    description: 'Configuration & monitoring',
    rooms: ['AP1']
  }
  // ... more buildings ...
};

class Outdoor {
  getInfo(buildingId) {
    return BUILDING_INFO[buildingId] || null;
  }
}
```

### 6. Click Detection Pattern

In Game3D (or similar), detect clicks on building zones:

```javascript
// src/core/Game3D.js

function onObjectClick(object) {
  // Find parent building
  var parent = object.parent;
  while (parent && !parent.buildingId) {
    parent = parent.parent;
  }
  
  if (parent && parent.buildingId) {
    var info = this.outdoor.getInfo(parent.buildingId);
    console.log('Clicked building:', info.name);
    // Trigger UI, navigate, etc.
  }
}
```

## Performance Tips

### 1. Frustum Culling

Only render objects in camera view:

```javascript
var frustum = new THREE.Frustum();
var matrix = new THREE.Matrix4().multiplyMatrices(
  camera.projectionMatrix,
  camera.matrixWorldInverse
);
frustum.setFromProjectionMatrix(matrix);

// Check if object is visible
if (frustum.intersectsObject(myMesh)) {
  // visible, render
}
```

### 2. Level of Detail (LOD)

Use fewer triangles for distant objects:

```javascript
var lod = new THREE.LOD();
lod.addLevel(detailedMesh, 0);    // 0–50 units: detailed
lod.addLevel(simpleMesh, 50);     // 50+ units: simplified
scene.add(lod);
```

### 3. Instancing for Repetitive Objects

Use InstancedMesh instead of multiple copies:

```javascript
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
var count = 100;
var instancedMesh = new THREE.InstancedMesh(geometry, material, count);

for (var i = 0; i < count; i++) {
  var matrix = new THREE.Matrix4();
  matrix.setPosition(Math.random() * 10, 0, Math.random() * 10);
  instancedMesh.setMatrixAt(i, matrix);
}

scene.add(instancedMesh);
```

## File Organization Example

```
src/
├── core/
│   ├── Game3D.js           — Main game loop
│   ├── Renderer3D.js       — WebGL setup
│   └── Camera3D.js         — Camera & controls
├── world/
│   └── Outdoor.js          — Outdoor scene (buildings, warp zones)
├── ui/
│   ├── ChatPanel.js
│   ├── BuildingInfoPanel.js
│   └── MapPanel.js
└── services/
    └── EventBus.js         — pub/sub for clicks, navigation
```

## Anti-Patterns to Avoid

❌ Material per mesh: `var mat = new THREE.MeshStandardMaterial(...); var mesh = new THREE.Mesh(geom, mat);` × 100 → slow  
✅ Material registry: create once, reuse `this.mat.concrete`

❌ Direct scene.add: `scene.add(mesh1); scene.add(mesh2);` scattered in code  
✅ Grouped: all buildings in `this._group`, add once to scene

❌ Hardcoded positions & colors: position values in 20 places  
✅ Data-driven: store in config arrays, iterate to build

❌ No culling: render 10,000 distant objects every frame  
✅ Frustum cull: only render visible objects

*Open source — use it wisely.*
