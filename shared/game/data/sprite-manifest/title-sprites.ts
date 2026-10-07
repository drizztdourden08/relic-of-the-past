/* @layer shared-game @kind data */
/**
 * The title screen's pictures, each extracted whole from the ROM
 * (shared/asset-extraction/title-screen): the logo, the Master Sword that drops into
 * it, the triforce behind the logo, and the lake and castle behind them all. Then the
 * four pictures of the story intro that follows it (shared/asset-extraction/story-intro).
 */
import type { SpriteDefinition } from './manifest';

const TITLE_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'title-logo',
    label: 'Title Logo',
    category: 'title',
    extract: { method: 'title-screen', part: 'logo' },
  },
  {
    file: 'title-sword',
    label: 'Title Sword',
    category: 'title',
    extract: { method: 'title-screen', part: 'sword' },
  },
  {
    file: 'title-triforce',
    label: 'Title Triforce',
    category: 'title',
    extract: { method: 'title-screen', part: 'triforce' },
  },
  {
    file: 'title-background',
    label: 'Title Background',
    category: 'title',
    extract: { method: 'title-screen', part: 'background' },
  },
  // The story intro's legend, in the order it is told.
  ...[1, 2, 3, 4].map((n): SpriteDefinition => ({
    file: `story-legend-${n}`,
    label: `Story Legend ${n}`,
    category: 'title',
    extract: { method: 'story-legend', legend: n - 1 },
  })),
];

export { TITLE_SPRITE_DEFINITIONS };
