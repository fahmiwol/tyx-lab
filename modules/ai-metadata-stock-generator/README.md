# AI Metadata Stock Generator

Generate marketplace-optimized metadata for stock assets (Adobe Stock, Shutterstock, microstock platforms).

## What This Does

Takes a subject descriptor and asset details, outputs:
- **Title** — capitalized, 8–70 characters, SEO-friendly
- **Keywords** — 10–25 tags, semantic + subject-derived
- **Description** — marketplace format (feature + use case)
- **Prompt** — ready for AI generation
- **QA Score** — validates completeness

## Input

```typescript
{
  subject: string;       // "modern workspace with team collaboration"
  assetType?: string;    // "illustration", "photo", "vector"
  style?: string;        // "clean commercial", "minimalist", "3d render"
  providerId?: string;   // provider ID for tracking
}
```

## Output

```typescript
{
  prompt: string;          // ready for DALL-E, Midjourney, etc.
  title: string;
  description: string;
  keywords: string[];
  aiProvider: string;
  safeMode: boolean;
}
```

## Usage

```typescript
import { generateMetadata, qaCheck } from './src/index';

const input = {
  subject: 'team meeting in startup office',
  assetType: 'illustration',
  style: 'modern flat design',
};

const metadata = generateMetadata(input);
console.log(metadata.title);        // "Team meeting in startup office"
console.log(metadata.keywords);     // [...25 keywords...]

// Validate before upload
const quality = qaCheck(metadata);
if (quality.status === 'ready') {
  // Queue for marketplace upload
}
```

## Why This Exists

Marketplace platforms (Adobe Stock, Shutterstock) have strict metadata requirements:
- Titles must be **searchable** (8–70 chars, keyword-forward)
- Keywords must be **relevant & diverse** (10–49 tags, no spam)
- Descriptions must be **use-case focused** (marketing, business, digital content)
- AI-generated assets must be **disclosed** (Adobe Stock requirement)

This module automates the repetitive work of formatting and validating metadata, extracted from a real microstock uploader system.

## Compatibility

- Works standalone — no dependencies
- Pairs with `ai-asset-quality-gate` for full QA pipeline
- Ready for Adobe Stock, Shutterstock, Alamy, Getty Images APIs

*Open source — use it wisely.*
