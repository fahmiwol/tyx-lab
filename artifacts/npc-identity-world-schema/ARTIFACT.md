# NPC Agent Identity & World-Object Schema: Gaming AI & Interactive Worlds

**Version:** 1.0.0 | **Category:** AI | **Status:** stable

## Overview

A unified data model for defining NPC identities, world state, and relationships in interactive systems. Supports emergent gameplay where NPCs react based on persistent memory and emotional state.

## Core: NPC Identity Schema

npc_id, name, role, faction
personality: archetype, traits, base_emotions
memory: episodic (events with emotional impact), semantic (facts about others)
skills, inventory, location
dialogue_constitution: rules/principles

## Hybrid Output: Text + Behavioral Intent

When NPC responds to player action:
1. Generate dialogue text
2. Generate behavioral_intent JSON:
   - action: what NPC does (combat, flee, help)
   - movement: destination, pathfinding
   - summon_allies: call faction?
3. Update state:
   - emotions change
   - new memory created
   - relationships updated
   - quests affected

## World-Object Schema

object_id, name, type (location/item/NPC)
state: discoverable, locked, contents
interactions: action -> npc_response, effect
affects_world: light source, energy, physics
location: zone, coordinates

## Memory System (SQL)

npc_episodic_memory: event, timestamp, emotional_valence, salience, decay
npc_semantic_memory: key-value facts, confidence, source

## Retrieval-Augmented Dialogue

1. Extract semantic memory (who are you, what do I know?)
2. Retrieve episodic memories (what happened between us?)
3. Load dialogue constitution (rules/principles)
4. Generate response constrained by all three

## Persistence

Snapshot NPC state at checkpoints:
- identity, emotions, last 50 memories
- semantic memory (full)
- location, quest state, relationship graph

*Open source — use it wisely.*
