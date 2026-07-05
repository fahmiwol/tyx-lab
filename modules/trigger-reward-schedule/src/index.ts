// Standard reward
await awardByTrigger('user_123', 'QUIZ_COMPLETE');
// Awards 3 Diamond (default)

// With bonus
await awardByTrigger('user_123', 'QUIZ_COMPLETE', 5);
// Awards 5 Diamond (override)

// With penalty
await awardByTrigger('user_123', 'MISSION', -2);
// Deducts 2 Diamond (cheat detection)