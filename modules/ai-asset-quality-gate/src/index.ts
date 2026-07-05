/**
 * AI Asset Quality Gate
 * Validates AI-generated content metadata with automated scoring
 * Version: 1.0.0
 */

export interface Asset {
  title?: string;
  keywords?: string[];
  assetType?: string;
  generativeAi?: boolean;
  aiDisclosure?: string;
  description?: string;
  prompt?: string;
  [key: string]: any;
}

export interface QualityCheckResult {
  status: 'ready' | 'needs_review' | 'blocked';
  score: number; // 0-100
  warnings: string[];
  passed: string[];
}

/**
 * Check title quality
 */
function checkTitle(title: string): { passed: string[]; warnings: string[] } {
  const passed: string[] = [];
  const warnings: string[] = [];

  if (!title) {
    warnings.push('Title is missing.');
    return { passed, warnings };
  }

  if (title.length < 8) {
    warnings.push('Title is too short (< 8 chars); marketplace search visibility may suffer.');
  } else {
    passed.push('Title length is adequate.');
  }

  if (title.length > 70) {
    warnings.push('Title exceeds 70 characters; may be truncated on some platforms.');
  } else {
    passed.push('Title is within optimal length.');
  }

  // Check for keyword presence
  const hasKeywords = /\b[a-z]{3,}\b/i.test(title);
  if (hasKeywords) {
    passed.push('Title contains searchable keywords.');
  } else {
    warnings.push('Title appears to lack searchable keywords.');
  }

  return { passed, warnings };
}

/**
 * Check keyword quality
 */
function checkKeywords(keywords: string[]): { passed: string[]; warnings: string[] } {
  const passed: string[] = [];
  const warnings: string[] = [];

  if (!keywords || keywords.length === 0) {
    warnings.push('No keywords provided.');
    return { passed, warnings };
  }

  if (keywords.length < 10) {
    warnings.push('Keyword count is low (< 10); add more for better discoverability.');
  } else {
    passed.push('Keyword count is sufficient.');
  }

  if (keywords.length > 49) {
    warnings.push(
      'Keyword count exceeds 49 (Adobe Stock limit); consider removing lower-priority tags.'
    );
  }

  // Check for duplicates
  const unique = new Set(keywords.map((k) => k.toLowerCase()));
  if (unique.size < keywords.length) {
    warnings.push(`${keywords.length - unique.size} duplicate keywords detected.`);
  } else {
    passed.push('All keywords are unique.');
  }

  // Check keyword length
  const tooLong = keywords.filter((k) => k.length > 30);
  if (tooLong.length > 0) {
    warnings.push(`${tooLong.length} keywords exceed 30 characters (may be truncated).`);
  }

  return { passed, warnings };
}

/**
 * Check AI disclosure compliance
 */
function checkAiDisclosure(asset: Asset): { passed: string[]; warnings: string[] } {
  const passed: string[] = [];
  const warnings: string[] = [];

  if (!asset.generativeAi) {
    passed.push('Asset is not marked as AI-generated.');
    return { passed, warnings };
  }

  // If AI-generated, disclosure is required
  if (!asset.aiDisclosure || asset.aiDisclosure.trim().length === 0) {
    warnings.push(
      'Asset is marked as AI-generated but lacks disclosure. Adobe Stock requires explicit AI disclosure.'
    );
  } else {
    passed.push('AI disclosure is present.');
  }

  return { passed, warnings };
}

/**
 * Main quality gate check
 */
export function checkAssetQuality(asset: Asset): QualityCheckResult {
  const allPassed: string[] = [];
  const allWarnings: string[] = [];

  // Title check
  const { passed: titlePassed, warnings: titleWarnings } = checkTitle(asset.title || '');
  allPassed.push(...titlePassed);
  allWarnings.push(...titleWarnings);

  // Keywords check
  const { passed: keywordsPassed, warnings: keywordsWarnings } = checkKeywords(
    asset.keywords || []
  );
  allPassed.push(...keywordsPassed);
  allWarnings.push(...keywordsWarnings);

  // Asset type check
  if (!asset.assetType) {
    allWarnings.push('Asset type is not specified.');
  } else {
    allPassed.push(`Asset type specified: ${asset.assetType}.`);
  }

  // AI disclosure check
  const { passed: disclosurePassed, warnings: disclosureWarnings } = checkAiDisclosure(asset);
  allPassed.push(...disclosurePassed);
  allWarnings.push(...disclosureWarnings);

  // Calculate score (max 100, deduct for warnings)
  const baseScore = 100;
  const deduction = allWarnings.length * 12; // 12 points per warning
  const score = Math.max(40, baseScore - deduction); // floor at 40

  // Determine status
  let status: 'ready' | 'needs_review' | 'blocked';
  if (allWarnings.length === 0) {
    status = 'ready';
  } else if (allWarnings.some((w) => w.includes('AI-generated'))) {
    status = 'blocked'; // Critical: missing AI disclosure
  } else {
    status = 'needs_review';
  }

  return {
    status,
    score,
    warnings: allWarnings,
    passed: allPassed,
  };
}

/**
 * Batch quality check multiple assets
 */
export function checkAssetsQuality(assets: Asset[]): QualityCheckResult[] {
  return assets.map(checkAssetQuality);
}

/**
 * Summary report
 */
export function generateQualityReport(results: QualityCheckResult[]): {
  totalAssets: number;
  readyCount: number;
  needsReviewCount: number;
  blockedCount: number;
  averageScore: number;
  criticalWarnings: string[];
} {
  const readyCount = results.filter((r) => r.status === 'ready').length;
  const needsReviewCount = results.filter((r) => r.status === 'needs_review').length;
  const blockedCount = results.filter((r) => r.status === 'blocked').length;
  const averageScore =
    results.reduce((sum, r) => sum + r.score, 0) / Math.max(results.length, 1);

  const criticalWarnings = Array.from(
    new Set(
      results.flatMap((r) =>
        r.warnings.filter((w) => w.includes('AI-generated') || w.includes('missing'))
      )
    )
  );

  return {
    totalAssets: results.length,
    readyCount,
    needsReviewCount,
    blockedCount,
    averageScore: Math.round(averageScore * 10) / 10,
    criticalWarnings,
  };
}
