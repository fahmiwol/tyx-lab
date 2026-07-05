# Brief to Storyboard to Video Pipeline

## Overview
Method for generating short-form video content from a brief, including Visual DNA design, storyboard generation, keyframe rendering, and video assembly.

## Stage 1: Project Intake & Brief

**Input:**
- Project title and description
- Campaign intent (promo, explainer, teaser, announcement)
- Target audience
- Key message or CTA
- Vibe/mood (energetic, professional, playful, cinematic)
- Reference images (inspiration, color palette)
- Brand guidelines
- Target platform (Instagram, TikTok, YouTube)
- Duration target (20-30 seconds)
- Aspect ratio (9:16 mobile, 16:9 landscape, 1:1 square)

**Deliverable:**
- Project created with metadata
- Visual DNA draft (colors, mood, typography)

## Stage 2: Visual DNA Definition

**Components:**
- Color Palette: 2-3 primary colors
- Mood Board: Keywords (dark/bright, energetic/calm, abstract/realistic)
- Typography: Font style
- Visual Style: 3D, flat design, photography, animation
- Brand Elements: Logo, brand colors
- Aspect Ratio and Duration: Locked

**Process:**
1. Upload reference images
2. Extract or confirm color palette
3. Select mood keywords
4. Choose typography style
5. Lock Visual DNA (immutable)

## Stage 3: Storyboard Generation

**Input:**
- Project brief
- Visual DNA (locked)
- Duration target (25 sec = 5-7 scenes at 3-5 sec each)

**AI-Powered Storyboard:**
1. LLM routes brief through narrative planner
2. Outputs scene breakdown per scene:
   - Scene number
   - Visual description
   - Text/dialogue
   - Camera movement
   - Timing/duration
   - Audio cue

**Output:**
Storyboard JSON with 5-7 scenes, ready for review.

## Stage 4: Storyboard Review & Edit

**User Approval Gate:**
- Review storyboard visually
- Approve or edit:
  - Change descriptions
  - Adjust timing
  - Reorder scenes
  - Delete or add scenes

**Locked Storyboard:**
Once approved, storyboard is immutable for next stages.

## Stage 5: Keyframe Generation

**Per Scene:**
1. Construct prompt using:
   - Scene visual description
   - Visual DNA (colors, mood, style)
   - Platform context

2. Call image provider (or use mock)
3. Receive keyframe image
4. Display in scene editor
5. Allow regeneration if needed

## Stage 6: Video Clip Generation

**Per Scene:**
1. Construct motion prompt using:
   - Keyframe image (start anchor)
   - Scene description and camera movement
   - Duration (from storyboard)
   - Visual DNA

2. Call video provider
3. Receive video clip (or mock placeholder)
4. Display in timeline
5. Allow preview and regeneration

**Mock Mode:**
- Return 3-second placeholder video
- Same dimensions and duration as real
- Labeled "MOCK CLIP"

## Stage 7: Timeline Assembly

**Combine Clips:**
1. Arrange scenes in storyboard order
2. Add transitions:
   - Cut (instant)
   - Crossfade (0.3 sec overlap)
   - Wipe (directional)
3. Add audio:
   - Background music
   - Dialogue/voiceover
   - Sound effects
4. Render final video

**Timeline Editor:**
- Scene cards in sequence
- Trim individual clips
- Adjust transitions
- Preview audio mix
- Export

## Stage 8: Export & Manifest

**Final Outputs:**
1. Video file: MP4 ready for upload
2. Manifest JSON: Project metadata and scene details
3. Download link
4. Share link (short URL)

## Workflow State Machine

draft
  → visual_dna_draft
  → visual_dna_locked
  → storyboard_draft
  → storyboard_locked
  → keyframes_processing
  → keyframes_completed
  → video_processing
  → video_completed
  → timeline_ready
  → export_processing
  → export_completed
  → published (or failed)

## Integration Points

**AI Providers:**
- Text (narrative planning)
- Image (keyframe generation)
- Vision (consistency validation)
- Video (clip generation)
- Audio (music/voiceover)

**Abstraction Layer:**
- Provider interface (adapter pattern)
- Mock implementations
- Swappable real providers
- Cost and quota tracking

## Quality Assurance

- Visual DNA locked and applied to all prompts
- Storyboard scenes make narrative sense
- Timing matches target duration
- Keyframes match Visual DNA
- Video clips are smooth and sequenced
- Transitions are clean
- Audio synchronized to video
- Final export plays correctly
- Manifest matches video metadata

## Common Workflows

**Promo Video:**
- 15 sec, 4 scenes
- Product reveal, feature, testimonial, CTA
- Bright, modern, brand colors

**Explainer:**
- 30 sec, 6 scenes
- Problem, solution, steps, CTA
- Calm, educational, soft colors

**Social Teaser:**
- 10 sec, 2-3 scenes
- Hook, mystery, CTA
- Energetic, bold, trending

---

*Open source — use it wisely.*
