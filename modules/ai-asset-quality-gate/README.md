# AI Asset Quality Gate

Automated QA checks for AI-generated content with compliance validation and scoring.

## What This Does

Validates AI asset metadata across:
- **Title** — length (8–70 chars), searchability
- **Keywords** — count (10–49), uniqueness, length
- **Asset type** — required field
- **AI disclosure** — compliance check (Adobe Stock, etc.)

Returns: `status` (ready/needs_review/blocked), `score` (0–100), and actionable warnings.

## Input

```typescript
{
  title: string;
  keywords: string[];
  assetType?: string;
  generativeAi?: boolean;
  aiDisclosure?: string;
}
```

## Output

```typescript
{
  status: 'ready' | 'needs_review' | 'blocked';
  score: number;           // 0-100
  warnings: string[];      // actionable feedback
  passed: string[];        // what's good
}
```

## Usage

```typescript
import { checkAssetQuality, generateQualityReport } from './src/index';

const asset = {
  title: 'Modern Workspace Team Meeting',
  keywords: ['meeting', 'team', 'office', 'workspace', 'collaboration', ...],
  assetType: 'illustration',
  generativeAi: true,
  aiDisclosure: 'Generated with AI. Edited and curated by creator.',
};

const result = checkAssetQuality(asset);
console.log(result.status);      // 'ready' | 'needs_review' | 'blocked'
console.log(result.score);       // 85
console.log(result.warnings);    // actionable feedback

// Batch check
const assets = [ {...}, {...} ];
const results = checkAssetsQuality(assets);
const report = generateQualityReport(results);
console.log(report);
// {
//   totalAssets: 100,
//   readyCount: 76,
//   needsReviewCount: 20,
//   blockedCount: 4,
//   averageScore: 81.3,
//   criticalWarnings: ['AI-generated but lacks disclosure', ...]
// }
```

## Why This Exists

Marketplace platforms enforce strict metadata quality:
- **Adobe Stock:** Requires AI disclosure, 10–49 keywords, title 8–70 chars
- **Shutterstock:** Similar constraints
- **Getty Images:** Distinct rules per category

Manual QA (checking each asset) is tedious; this gate automates it.

Built from real microstock uploader — validated against Adobe Stock's actual requirements.

## Compatibility

- Works standalone
- Pairs with `ai-metadata-stock-generator` (pipeline: generate → gate → upload)
- Useful for any content platform needing QA gates

*Open source — use it wisely.*
