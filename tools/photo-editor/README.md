# Photo Editor (Sharp)

Real-time image processing with Sharp library.

## Features

- **Adjustments** — Brightness, saturation, rotation, blur, sharpen
- **Presets** — vivid, matte, bw, warm, cool, fade, vintage
- **Format Support** — JPEG, PNG with quality control
- **API-driven** — Stateless image processing
- **CORS Support** — Multiple origin configuration

## Setup

```bash
cd tools/photo-editor
npm install
npm run dev
```

Run two terminals:
```bash
# Terminal 1
npm run server

# Terminal 2
npm run client
```

Open `http://localhost:5174`.

## API

```
POST /photo/process
Content-Type: multipart/form-data

Fields:
  image (file) — source image
  ops (JSON) — processing operations
```

Response:
```json
{
  "success": true,
  "data": {
    "mime": "image/jpeg",
    "base64": "...",
    "bytes": 12345
  }
}
```

Operations JSON:
```json
{
  "brightness": 1.1,
  "saturation": 1.2,
  "rotate": 45,
  "blur": 5,
  "sharpen": 2,
  "preset": "vivid",
  "format": "jpeg",
  "quality": 80
}
```

Open source — use it wisely.