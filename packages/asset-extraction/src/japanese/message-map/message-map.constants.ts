/* @layer shared-asset-extraction @kind constants */
import type { MessageRange } from './message-map.type';

const US_MESSAGE_COUNT = 397;

const MESSAGE_RANGES: readonly MessageRange[] = [
  { us: 0, japanese: 0, count: 11 },
  { us: 13, japanese: 11, count: 384 },
];

const CURSOR_GLYPH = '';

const US_ONLY_MESSAGES: ReadonlyMap<number, string> = new Map([
  [11, `[Speed 00][3]   [2]  ${CURSOR_GLYPH}[Selchg]`],
  [12, `[Speed 00][2]   [3]  ${CURSOR_GLYPH}[Selchg]`],
]);

export { MESSAGE_RANGES, US_MESSAGE_COUNT, US_ONLY_MESSAGES };
