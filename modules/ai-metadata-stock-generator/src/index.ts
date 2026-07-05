/**
 * AI Metadata Stock Generator
 * Generates marketplace-optimized metadata for stock assets
 * Version: 1.0.0
 */

export interface StockInput {
  subject: string;
  assetType?: string;
  style?: string;
  providerId?: string;
}

export interface StockMetadata {
  prompt: string;
  title: string;
  description: string;
  keywords: string[];
  aiProvider: string;
  safeMode: boolean;
}

/**
 * Generate metadata for stock marketplace assets
 * Input: subject (e.g., "modern workspace productivity")
 * Output: optimized title, keywords, description for Adobe Stock, Shutterstock, etc.
 */
export function generateMetadata(input: StockInput): StockMetadata {
  const subject = input.subject || 'modern workspace productivity illustration';
  const assetType = input.assetType || 'illustration';
  const style = input.style || 'clean commercial';

  // Generate title: limit to 10 words, capitalize
  const title = subject
    .split(' ')
    .slice(0, 10)
    .join(' ')
    .trim();
  const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  // Generate semantic keywords
  const baseKeywords = [
    'microstock',
    'commercial',
    'creative',
    'digital',
    'design',
    'business',
    'marketing',
    'technology',
    'productivity',
    'modern',
    assetType,
    style.replace(/\s+/g, '-'),
  ].filter(Boolean);

  // Subject words as keywords
  const subjectKeywords = subject
    .split(' ')
    .filter((word) => word.length > 3)
    .map((w) => w.toLowerCase());

  const keywords = Array.from(new Set([...baseKeywords, ...subjectKeywords]))
    .slice(0, 25)
    .filter(Boolean);

  return {
    prompt: `Create a ${style} ${assetType} about ${subject}, high quality, useful for commercial stock marketplace.`,
    title: capitalizedTitle,
    description: `Commercial ${assetType} featuring ${subject}, designed for marketing, business, and digital content use.`,
    keywords,
    aiProvider: input.providerId || 'template-safe-mode',
    safeMode: true,
  };
}

export interface QACheckResult {
  status: 'ready' | 'needs_review';
  score: number;
  warnings: string[];
}

/**
 * Quality assurance check for stock asset metadata
 * Validates title length, keyword count, AI disclosure
 */
export function qaCheck(asset: any): QACheckResult {
  const warnings: string[] = [];
  const title = asset.title || '';
  const keywords = asset.keywords || [];

  if (title.length < 8) {
    warnings.push('Title is too short for marketplace search.');
  }
  if (title.length > 70) {
    warnings.push('Title may be too long for some microstock platforms.');
  }
  if (keywords.length < 10) {
    warnings.push('Add at least 10 relevant keywords.');
  }
  if (keywords.length > 49) {
    warnings.push(
      'Adobe Stock commonly expects a focused keyword set; avoid spammy keywords.'
    );
  }
  if (!asset.assetType) {
    warnings.push('Asset type is missing.');
  }
  if (asset.generativeAi && !asset.aiDisclosure) {
    warnings.push('Generative AI disclosure is missing.');
  }

  return {
    status: warnings.length ? 'needs_review' : 'ready',
    score: Math.max(40, 100 - warnings.length * 15),
    warnings,
  };
}

export interface UploadQueueItem {
  id: string;
  assetId: string;
  platform: string;
  mode: string;
  status: string;
  note: string;
  createdAt: string;
}

/**
 * Queue asset for upload to marketplace
 * Supports multiple platforms: Adobe Stock, Shutterstock, etc.
 */
export function queueUpload(asset: any, connector?: any): UploadQueueItem {
  const mode = connector?.uploadMode || 'manual';
  const blocked =
    mode === 'sftp' &&
    (!connector?.host || !connector?.username || !connector?.password);

  return {
    id: `upload_${Date.now()}`,
    assetId: asset.id,
    platform: 'adobe-stock',
    mode,
    status: blocked
      ? 'blocked_missing_sftp_credentials'
      : mode === 'sftp'
        ? 'sftp-demo-ready'
        : 'manual-ready',
    note: blocked
      ? 'SFTP requires host, username, and password.'
      : 'Safe-mode queue item created. Real upload requires platform credentials via process.env.',
    createdAt: new Date().toISOString(),
  };
}
