# Ken Burns FFmpeg Renderer

Cinematic image→video conversion using the Ken Burns zoom-pan effect.

## About Ken Burns

The Ken Burns effect is a slow, smooth zoom-in/out with subtle panning across a still image. Commonly used in documentaries and slideshows to add motion and depth to photography.

## Features

- **Cross-platform**: Bundled ffmpeg binary via `ffmpeg-static` (no system ffmpeg required).
- **Configurable**: Duration, zoom range, pan direction, frame rate.
- **Audio support**: Optional voiceover or background music padding.
- **Batch rendering**: Render multiple images in sequence and concatenate to single MP4.
- **Promise-based**: Async/await friendly.

## Installation

```bash
npm install ffmpeg-static
```

## Usage

### Single Image

```typescript
import { KenBurnsRenderer } from './index.ts';

const renderer = new KenBurnsRenderer();
const result = await renderer.renderImage({
  inputPath: './input/photo.jpg',
  duration: 5,           // 5 seconds
  zoomStart: 1.0,        // 100% zoom (no zoom)
  zoomEnd: 1.15,         // 115% zoom (15% zoom-in)
  panX: 0,               // no left-right pan
  panY: 0.1,             // slight downward pan
  outputPath: './output/video.mp4',
  audioPad: './audio/voiceover.wav'  // optional
});

if (result.success) {
  console.log(`Rendered: ${result.path}`);
} else {
  console.error(`Failed: ${result.error}`);
}
```

### Batch Rendering (Image Sequence)

```typescript
const images = [
  { inputPath: './img1.jpg', duration: 4, zoomStart: 1.0, zoomEnd: 1.1, outputPath: './tmp/out1.mp4' },
  { inputPath: './img2.jpg', duration: 5, zoomStart: 1.1, zoomEnd: 1.2, outputPath: './tmp/out2.mp4' },
  { inputPath: './img3.jpg', duration: 3, zoomStart: 1.0, zoomEnd: 1.05, outputPath: './tmp/out3.mp4' }
];

const result = await renderer.renderImageSequence(images, './output/final.mp4');
```

## Pan/Zoom Parameters

- **zoomStart/zoomEnd**: 1.0 = original size, 1.2 = 20% zoom-in. Keep in 1.0–2.0 range.
- **panX**: -1 (left) to 1 (right). 0 = no horizontal pan.
- **panY**: -1 (up) to 1 (down). 0.1 = slight downward pan. Common for documentary-style effect.

## Performance

Depends on image resolution and ffmpeg system. Typical: 5-second 1080p MP4 takes 5–10 seconds to render on modern hardware.

## Limitations

- Requires ffmpeg (via `ffmpeg-static`).
- Input image must exist and be readable.
- Output directory is auto-created if missing.
- Audio must be same duration or shorter than video.

*Open source — use it wisely.*
