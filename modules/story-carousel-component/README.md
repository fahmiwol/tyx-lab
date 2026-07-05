# Story Carousel Component

Instagram-style story carousel using compound component pattern. Supports horizontal scroll, auto-advance, click navigation, and accessibility.

## What It Does

Renders a carousel of stories with:
- Horizontal infinite scroll (wraps around)
- Optional auto-advance timer per story
- Click/tap to move to next, nav buttons, index dots
- Active state + progress bar
- Accessible (ARIA roles, labels)
- Tailwind-styled (customize className)

## Input

- `stories`: Array of Story objects (id, src, duration, caption, metadata)
- `currentIndex`: Current story position
- `onIndexChange`: Callback when user navigates

## Output

- Rendered carousel (HTML list + nav controls)
- State updates (current index, auto-advance timer)

## Usage

```typescript
import { Stories } from "@tiranyx/story-carousel-component";

const stories = [
  { id: "1", src: "image1.jpg", duration: 5000, caption: "Story 1" },
  { id: "2", src: "image2.jpg", duration: 5000, caption: "Story 2" },
  { id: "3", src: "image3.jpg", duration: 5000, caption: "Story 3" },
];

export function StoryCarousel() {
  return (
    <Stories stories={stories} onIndexChange={(idx) => console.log(idx)}>
      <Stories.List>
        {stories.map((story) => (
          <Stories.Story
            key={story.id}
            src={story.src}
            isActive={index === stories.indexOf(story)}
            onClick={() => handleNavigation()}
            duration={story.duration}
          >
            {story.caption}
          </Stories.Story>
        ))}
      </Stories.List>

      <Stories.Nav>
        <Stories.PrevButton />
        <Stories.Dots />
        <Stories.NextButton />
      </Stories.Nav>
    </Stories>
  );
}
```

## Dependencies

- React 16.8+ (hooks)
- Tailwind CSS 3+ (styling)

## Why This Exists

Story-based UX (Instagram, Snapchat, WhatsApp) is now table-stakes for social & content apps. Building carousel UX from scratch is error-prone:
- Timing gets complex (auto-advance, pausing, duration)
- Navigation edge cases (wrapping, out-of-bounds)
- Accessibility is an afterthought (ARIA, keyboard)

This component handles the plumbing so you focus on:
1. Custom styling (Tailwind className override)
2. Animation (add Framer Motion for fade/slide)
3. State management (integrate Zustand/Redux as needed)

The compound component pattern lets you mix-and-match sub-components (List, Story, Nav, Dots, PrevButton, NextButton) to suit your layout.

## Customization

- **Styling**: Override className on any sub-component
- **Duration**: Pass `duration` prop (ms) per story for auto-advance
- **Animation**: Wrap sub-components in Framer Motion `<motion.*>`
- **Indicators**: Use `Stories.Dots` or build custom progress bar

## Related Atoms

- `infinite-feed-renderer` — companion for horizontal feed layouts

Open source — use it wisely.
