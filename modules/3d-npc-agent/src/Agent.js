// Agent.js — AI Agent NPC with random movement and states in 3D isometric world
import { isInBounds } from '../utils/IsoMath.js';

export class Agent {
  constructor(def, room) {
    // Identity
    this.id = def.id;
    this.agentId = def.agentId || null;
    this.name = def.name;
    this.role = def.role || 'Agent';
    this.color = def.color || '#7b2ff7';
    this.hairColor = def.hairColor || '#442211';

    // Position
    this.x = def.startX ?? room.spawnPoint.x + 2;
    this.y = def.startY ?? room.spawnPoint.y - 2;
    this.targetX = this.x;
    this.targetY = this.y;

    // Movement
    this.speed = 0.04 + Math.random() * 0.02;
    this.moving = false;

    // State machine: idle | walking | working
    this.state = 'idle';
    this.stateTimer = 0;
    this.idleDuration = 2 + Math.random() * 3;
    this.workDuration = 3 + Math.random() * 5;

    // Room reference
    this.room = room;

    // Wander area
    this.homeX = this.x;
    this.homeY = this.y;
    this.wanderRadius = def.wanderRadius ?? 4;

    // Behavior tree
    this.behaviorTreeId = def.behaviorTreeId || null;
    this.btState = { action: 'idle', target: null };
  }

  // Update position and state each frame
  update(dt) {
    this.stateTimer += dt;

    switch (this.state) {
      case 'idle':
        if (this.stateTimer >= this.idleDuration) {
          this.decideNextAction();
        }
        break;

      case 'walking':
        this.moveTowardTarget(dt);
        if (Math.abs(this.x - this.targetX) < 0.2 && Math.abs(this.y - this.targetY) < 0.2) {
          this.x = this.targetX;
          this.y = this.targetY;
          this.state = 'working';
          this.stateTimer = 0;
        }
        break;

      case 'working':
        if (this.stateTimer >= this.workDuration) {
          this.state = 'idle';
          this.stateTimer = 0;
        }
        break;
    }
  }

  decideNextAction() {
    const r = Math.random();
    if (r < 0.7) {
      // Wander within radius
      this.targetX = this.homeX + (Math.random() - 0.5) * this.wanderRadius * 2;
      this.targetY = this.homeY + (Math.random() - 0.5) * this.wanderRadius * 2;
      if (isInBounds(this.targetX, this.targetY, this.room)) {
        this.state = 'walking';
      }
    }
    this.stateTimer = 0;
    this.idleDuration = 2 + Math.random() * 3;
  }

  moveTowardTarget(dt) {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0.1) {
      this.x += (dx / dist) * this.speed * dt * 60;
      this.y += (dy / dist) * this.speed * dt * 60;
      this.moving = true;
    } else {
      this.moving = false;
    }
  }

  // Get rendering position
  getRenderPos() {
    return { x: this.x, y: this.y, z: 0 };
  }
}
