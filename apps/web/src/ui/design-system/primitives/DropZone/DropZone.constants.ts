/* @layer renderer-components @kind constants */
/**
 * The drop zone's glyphs, lucide's outlines on their 24-unit grid, drawn by the Icon
 * primitive with a stroke instead of a fill: a package (a box) by default.
 */
const BOX_ICON_PATHS = [
  'm7.5 4.27l9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z',
  'm3.3 7l8.7 5l8.7-5M12 22V12',
];

const ICON_VIEWBOX = '0 0 24 24';
const ICON_SIZE = 28;

/** SVG attributes that turn the Icon primitive's filled glyph into lucide's outline. */
const OUTLINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export { BOX_ICON_PATHS, ICON_VIEWBOX, ICON_SIZE, OUTLINE };
