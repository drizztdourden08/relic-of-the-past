/* @layer shared-asset-extraction @kind constants */
const WIDTH_DETAILS = {
  base: 'Read at the usual place.',
  unchecked: 'Read at the usual place. No release ROM was at hand to check it.',
  moved: 'The patch moved the width table; found it by searching the ROM.',
  release: 'The width table was not found; the release widths are used.',
} as const;

const UNKNOWN_SHARE_WARNING = 0.25;

export { UNKNOWN_SHARE_WARNING, WIDTH_DETAILS };
