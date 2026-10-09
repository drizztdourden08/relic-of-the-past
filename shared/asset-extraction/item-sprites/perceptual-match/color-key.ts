/* @layer shared-asset-extraction @kind logic */
import type { RGBA } from '../../graphics/palette';

const colorKey = (c: RGBA): number => (c[0] << 16) | (c[1] << 8) | c[2];

export { colorKey };
