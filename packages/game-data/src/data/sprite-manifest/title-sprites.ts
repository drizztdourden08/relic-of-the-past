/* @layer shared-game @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { SpriteDefinition } from './manifest';

const legendSprite = (n: 1 | 2 | 3 | 4): SpriteDefinition => ({
  file: `story-legend-${n}`,
  label: msg('game-labels:sprite.storyLegend', { n }),
  category: 'title',
  extract: { method: 'story-legend', legend: n - 1 },
});

const TITLE_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'title-logo',
    label: msg('game-labels:sprite.titleLogo'),
    category: 'title',
    extract: { method: 'title-screen', part: 'logo' },
  },
  {
    file: 'title-sword',
    label: msg('game-labels:sprite.titleSword'),
    category: 'title',
    extract: { method: 'title-screen', part: 'sword' },
  },
  {
    file: 'title-triforce',
    label: msg('game-labels:sprite.titleTriforce'),
    category: 'title',
    extract: { method: 'title-screen', part: 'triforce' },
  },
  {
    file: 'title-background',
    label: msg('game-labels:sprite.titleBackground'),
    category: 'title',
    extract: { method: 'title-screen', part: 'background' },
  },
  legendSprite(1),
  legendSprite(2),
  legendSprite(3),
  legendSprite(4),
];

export { TITLE_SPRITE_DEFINITIONS };
