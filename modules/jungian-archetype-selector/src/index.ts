/**
 * Jungian 12 Brand Archetypes
 *
 * The canonical reference for strategic brand positioning.
 * Each archetype carries a distinct motivation, core desire, voice profile, and positioning vector.
 *
 * Used for:
 * - Brand strategy workshops (pick one or blend two)
 * - Narrative consistency validation
 * - Orthogonal alternative generation (force each alternative to use different quadrant)
 * - Voice & tone calibration
 *
 * Open source — use it wisely.
 */

export type ArchetypeQuadrant = "STABILITY" | "BELONGING" | "MASTERY" | "INDEPENDENCE";

export type Archetype =
  | "caregiver" | "ruler" | "creator"
  | "jester" | "everyman" | "lover"
  | "hero" | "outlaw" | "magician"
  | "innocent" | "sage" | "explorer";

export interface ArchetypeProfile {
  name: string;
  quadrant: ArchetypeQuadrant;
  motivation: string;
  coreDesire: string;
  brandExamples: string[];
  voiceMarkers: string[];
}

export const ARCHETYPE_QUADRANTS: Record<ArchetypeQuadrant, Archetype[]> = {
  STABILITY: ["caregiver", "ruler", "creator"],
  BELONGING: ["jester", "everyman", "lover"],
  MASTERY: ["hero", "outlaw", "magician"],
  INDEPENDENCE: ["innocent", "sage", "explorer"],
};

export const ARCHETYPES: Record<Archetype, ArchetypeProfile> = {
  caregiver: {
    name: "Caregiver",
    quadrant: "STABILITY",
    motivation: "Service and protection of others",
    coreDesire: "To care, nurture, and protect",
    brandExamples: ["Healthcare provider", "Community foundation", "Safety-first brand"],
    voiceMarkers: ["warm", "reassuring", "present", "selfless"],
  },
  ruler: {
    name: "Ruler",
    quadrant: "STABILITY",
    motivation: "Control, prosperity, mastery of domain",
    coreDesire: "To create order and lead with authority",
    brandExamples: ["Enterprise software", "Luxury goods", "Management consulting"],
    voiceMarkers: ["authoritative", "refined", "decisive", "commanding"],
  },
  creator: {
    name: "Creator",
    quadrant: "STABILITY",
    motivation: "Imagination and self-expression",
    coreDesire: "To make things of enduring value",
    brandExamples: ["Design studio", "Craft brand", "Creative tools"],
    voiceMarkers: ["imaginative", "expressive", "craft-oriented", "generative"],
  },
  jester: {
    name: "Jester",
    quadrant: "BELONGING",
    motivation: "Joy and play in the present moment",
    coreDesire: "To live joyfully and lighten the world",
    brandExamples: ["Humor-first brand", "Playful consumer product", "Entertainment"],
    voiceMarkers: ["playful", "irreverent", "witty", "spontaneous"],
  },
  everyman: {
    name: "Everyman",
    quadrant: "BELONGING",
    motivation: "Connection, fairness, and belonging",
    coreDesire: "To belong and connect on equal terms",
    brandExamples: ["Affordable furniture", "Community marketplace", "Accessible tech"],
    voiceMarkers: ["down-to-earth", "honest", "inclusive", "relatable"],
  },
  lover: {
    name: "Lover",
    quadrant: "BELONGING",
    motivation: "Intimacy, sensual pleasure, beauty",
    coreDesire: "To experience beauty and deep connection",
    brandExamples: ["Luxury fragrance", "Fashion house", "Intimate wellness"],
    voiceMarkers: ["sensual", "passionate", "intimate", "indulgent"],
  },
  hero: {
    name: "Hero",
    quadrant: "MASTERY",
    motivation: "Mastery through courage and discipline",
    coreDesire: "To prove worth through brave action",
    brandExamples: ["Athletic brand", "Logistics leader", "Consumer durables"],
    voiceMarkers: ["determined", "courageous", "competitive", "honest"],
  },
  outlaw: {
    name: "Outlaw",
    quadrant: "MASTERY",
    motivation: "Liberation and disruption of broken systems",
    coreDesire: "To break the rules that no longer serve",
    brandExamples: ["Motorcycle brand", "Activist lifestyle", "Anti-establishment"],
    voiceMarkers: ["rebellious", "candid", "defiant", "uncompromising"],
  },
  magician: {
    name: "Magician",
    quadrant: "MASTERY",
    motivation: "Transformation through vision and insight",
    coreDesire: "To make dreams real and reveal the unseen",
    brandExamples: ["Tech innovator", "Entertainment giant", "Automotive disruptor"],
    voiceMarkers: ["visionary", "transformative", "mysterious", "inspirational"],
  },
  innocent: {
    name: "Innocent",
    quadrant: "INDEPENDENCE",
    motivation: "Simple goodness, optimism, purity",
    coreDesire: "To be happy and live without harm",
    brandExamples: ["Wellness brand", "Soft drink", "Organic food"],
    voiceMarkers: ["pure", "optimistic", "simple", "honest"],
  },
  sage: {
    name: "Sage",
    quadrant: "INDEPENDENCE",
    motivation: "Truth, understanding, and wisdom",
    coreDesire: "To analyze and understand the world",
    brandExamples: ["Research institute", "Educational tech", "News organization"],
    voiceMarkers: ["thoughtful", "analytical", "educational", "authentic"],
  },
  explorer: {
    name: "Explorer",
    quadrant: "INDEPENDENCE",
    motivation: "Freedom, discovery, and authentic experience",
    coreDesire: "To experience freedom and authenticity",
    brandExamples: ["Adventure brand", "Travel platform", "Outdoor gear"],
    voiceMarkers: ["adventurous", "candid", "pioneering", "restless"],
  },
};

/**
 * Get archetype by name (with type safety)
 */
export function getArchetype(name: Archetype): ArchetypeProfile {
  return ARCHETYPES[name];
}

/**
 * Get all archetypes in a quadrant
 */
export function getArchetypesInQuadrant(quadrant: ArchetypeQuadrant): ArchetypeProfile[] {
  return ARCHETYPE_QUADRANTS[quadrant].map(name => ARCHETYPES[name]);
}

/**
 * Validate that three archetypes span different quadrants
 * (useful for ensuring brand direction alternatives are orthogonal)
 */
export function validateOrthogonalSelection(archetypes: Archetype[]): boolean {
  if (archetypes.length !== 3) return false;
  const quadrants = new Set(archetypes.map(a => ARCHETYPES[a].quadrant));
  return quadrants.size === 3;
}

/**
 * Get voice marker union — useful for consistency checking
 */
export function getUnionVoiceMarkers(archetypeNames: Archetype[]): Set<string> {
  const markers = new Set<string>();
  archetypeNames.forEach(name => {
    ARCHETYPES[name].voiceMarkers.forEach(m => markers.add(m));
  });
  return markers;
}
