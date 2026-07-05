# Background Remover

Remove image backgrounds instantly with AI-powered processing. Perfect for product photos, portraits, and microstock preparation.

## Features

- Drag-and-drop image upload (JPG, PNG, WebP, BMP)
- Instant background removal with BiRefNet model
- Before/after comparison view
- Interactive slider comparison
- Batch processing (up to 10 files)
- Download as PNG with transparency
- Copy result to clipboard as base64

## How to Run

Open `src/index.html` in a web browser. Works offline once loaded.

## Configuration

By default, connects to local API gateway at `http://localhost:9797`. Configure via localStorage:

```javascript
localStorage.setItem('mighan_gateway_url', 'YOUR_API_ENDPOINT');
```

## Requirements

- Modern web browser with File API support
- (Optional) rembg server running for backend processing

## Tips

- High-contrast images work best
- Perfect for e-commerce product photos
- Export as PNG for microstock platforms

*Open source — use it wisely.*
