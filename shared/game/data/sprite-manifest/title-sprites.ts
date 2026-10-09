/* @layer shared-game @kind data */
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
  { file: 'story-legend-1', label: 'Story Legend 1', category: 'title', extract: { method: 'story-legend', legend: 0 } },
  { file: 'story-legend-2', label: 'Story Legend 2', category: 'title', extract: { method: 'story-legend', legend: 1 } },
  { file: 'story-legend-3', label: 'Story Legend 3', category: 'title', extract: { method: 'story-legend', legend: 2 } },
  { file: 'story-legend-4', label: 'Story Legend 4', category: 'title', extract: { method: 'story-legend', legend: 3 } },
];

export { TITLE_SPRITE_DEFINITIONS };
