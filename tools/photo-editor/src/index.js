/**
 * MighanPhoto API — by Cursor (CommonJS + Sharp)
 */
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');

const PORT = process.env.PORT || 3002;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }
});

const app = express();
app.use(
  cors({
    origin: ['http://localhost:9797', 'http://localhost:8080', 'http://localhost:5174'],
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { service: 'mighan-photo', version: '0.1.0', port: PORT, sharp: sharp.versions }
  });
});

/** Preset Instagram-style-ish maps to sharp pipeline */
function applyPreset(pipeline, preset) {
  switch (preset) {
    case 'vivid':
      return pipeline.modulate({ saturation: 1.35, brightness: 1.02 });
    case 'matte':
      return pipeline.gamma(1.12).modulate({ brightness: 0.98, saturation: 0.92 });
    case 'bw':
      return pipeline.grayscale();
    case 'warm':
      return pipeline.tint({ r: 255, g: 230, b: 200 }).modulate({ saturation: 1.08 });
    case 'cool':
      return pipeline.tint({ r: 200, g: 220, b: 255 }).modulate({ saturation: 1.05 });
    case 'fade':
      return pipeline.gamma(1.05).linear(0.92, 255 * 0.04);
    case 'vintage':
      return pipeline
        .recomb([
          [0.393, 0.769, 0.189],
          [0.349, 0.686, 0.168],
          [0.272, 0.534, 0.131]
        ])
        .gamma(1.08);
    default:
      return pipeline;
  }
}

app.post('/photo/process', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Field image (file) wajib' });
    }
    let ops = {};
    if (req.body.ops) {
      try {
        ops = typeof req.body.ops === 'string' ? JSON.parse(req.body.ops) : req.body.ops;
      } catch {
        return res.status(400).json({ success: false, error: 'ops JSON tidak valid' });
      }
    }

    let img = sharp(req.file.buffer).rotate(ops.rotate || 0);

    const { brightness = 1, saturation = 1 } = ops;
    img = img.modulate({
      brightness: Math.max(0.2, Math.min(2.5, Number(brightness) || 1)),
      saturation: Math.max(0, Math.min(3, Number(saturation) || 1))
    });

    if (ops.preset) img = applyPreset(img, String(ops.preset));

    const blur = Number(ops.blur) || 0;
    if (blur > 0) img = img.blur(Math.min(blur, 30));

    const sharpen = Number(ops.sharpen) || 0;
    if (sharpen > 0) img = img.sharpen({ sigma: Math.min(sharpen, 10) });

    const fmt = ops.format === 'png' ? 'png' : 'jpeg';
    const quality = Math.max(40, Math.min(100, Number(ops.quality) || 88));
    if (fmt === 'png') img = img.png({ compressionLevel: 9 });
    else img = img.jpeg({ quality, mozjpeg: true });

    const out = await img.toBuffer();
    const mime = fmt === 'png' ? 'image/png' : 'image/jpeg';
    res.json({
      success: true,
      data: {
        mime,
        base64: out.toString('base64'),
        bytes: out.length
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`[by Cursor] MighanPhoto API http://localhost:${PORT}`);
});
