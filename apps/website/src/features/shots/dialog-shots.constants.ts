/* @layer website-site @kind data */
import type { Screenshot } from '../screenshot.type';

const DIALOG_SHOTS = {
  original: {
    id: 'dialog-original',
    src: 'media/shots/dialog-original.webp',
    width: 1091,
    height: 956,
    alt: "Uncle's message in Link's house in the original message box",
  },
  triforce: {
    id: 'dialog-triforce',
    src: 'media/shots/dialog-triforce.webp',
    width: 1091,
    height: 956,
    alt: 'The enhanced message box with a single stone border and a Triforce texture',
  },
  gold: {
    id: 'dialog-gold',
    src: 'media/shots/dialog-gold.webp',
    width: 1091,
    height: 956,
    alt: 'The enhanced message box with a double gold border',
  },
  scanlines: {
    id: 'dialog-scanlines',
    src: 'media/shots/dialog-scanlines.webp',
    width: 1091,
    height: 956,
    alt: 'The enhanced message box with no border and a scanline texture',
  },
  hex: {
    id: 'dialog-hex',
    src: 'media/shots/dialog-hex.webp',
    width: 1091,
    height: 956,
    alt: 'The enhanced message box with a gold border and a hexagon tile texture',
  },
  stripes: {
    id: 'dialog-stripes',
    src: 'media/shots/dialog-stripes.webp',
    width: 1091,
    height: 956,
    alt: 'The enhanced message box in green with a striped texture',
  },
  outline: {
    id: 'dialog-outline',
    src: 'media/shots/dialog-outline.webp',
    width: 1091,
    height: 956,
    alt: 'The enhanced message box with a red outline',
  },
} as const satisfies Record<string, Screenshot>;

export { DIALOG_SHOTS };
