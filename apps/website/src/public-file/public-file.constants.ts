/* @layer website-site @kind constants */
const PUBLIC_FILES = {
  heroArt: 'media/hero-art.webp',
  mark: 'logos/logo.svg',
  wordmark: 'logos/wordmark.svg',
} as const;

const PUBLIC_FILE_RATIOS = {
  mark: '35 / 28',
  wordmark: '321 / 29',
} as const;

export { PUBLIC_FILE_RATIOS, PUBLIC_FILES };
