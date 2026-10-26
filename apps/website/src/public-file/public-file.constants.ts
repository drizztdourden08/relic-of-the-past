/* @layer website-site @kind constants */
const PUBLIC_FILES = {
  heroArt: 'media/hero-art.webp',
  mark: 'logos/mark.png',
  wordmark: 'logos/wordmark.png',
} as const;

const PUBLIC_FILE_RATIOS = {
  mark: '870 / 753',
  wordmark: '967 / 109',
} as const;

export { PUBLIC_FILE_RATIOS, PUBLIC_FILES };
