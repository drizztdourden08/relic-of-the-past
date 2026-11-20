/* @layer shared-game @kind data */
import type { SpriteDefinition } from './manifest';

const TITLE_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'title-logo',
    label: { key: 'game-labels:sprite.titleLogo' },
    category: 'title',
    extract: { method: 'title-screen', part: 'logo' },
  },
  {
    file: 'title-sword',
    label: { key: 'game-labels:sprite.titleSword' },
    category: 'title',
    extract: { method: 'title-screen', part: 'sword' },
  },
  {
    file: 'title-triforce',
    label: { key: 'game-labels:sprite.titleTriforce' },
    category: 'title',
    extract: { method: 'title-screen', part: 'triforce' },
  },
  {
    file: 'title-background',
    label: { key: 'game-labels:sprite.titleBackground' },
    category: 'title',
    extract: { method: 'title-screen', part: 'background' },
  },
  {
    file: 'story-legend-1',
    label: { key: 'game-labels:sprite.storyLegend', values: { n: 1 } },
    category: 'title',
    extract: { method: 'story-legend', legend: 0 },
  },
  {
    file: 'story-legend-2',
    label: { key: 'game-labels:sprite.storyLegend', values: { n: 2 } },
    category: 'title',
    extract: { method: 'story-legend', legend: 1 },
  },
  {
    file: 'story-legend-3',
    label: { key: 'game-labels:sprite.storyLegend', values: { n: 3 } },
    category: 'title',
    extract: { method: 'story-legend', legend: 2 },
  },
  {
    file: 'story-legend-4',
    label: { key: 'game-labels:sprite.storyLegend', values: { n: 4 } },
    category: 'title',
    extract: { method: 'story-legend', legend: 3 },
  },
];

export { TITLE_SPRITE_DEFINITIONS };
