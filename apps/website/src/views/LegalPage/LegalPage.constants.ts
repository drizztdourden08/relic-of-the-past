/* @layer website-site @kind constants */
const LEGAL_PAGE_TEXT = {
  back: 'Back to the home page',
  updated: (date: string): string => `Last updated ${date}`,
} as const;

export { LEGAL_PAGE_TEXT };
