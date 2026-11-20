/* @layer shared-game @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { SpriteDefinition } from './manifest';

const GREEN_LIGHT = '#9cd673';
const GREEN_DARK = '#4a9431';

const RUPEE_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'receipt-rupee-purple',
    label: msg('game-labels:sprite.rupeePurple'),
    category: 'receipt',
    extract: {
      method: 'palette-swap',
      baseFile: 'receipt-rupee-1',
      colors: [{ from: GREEN_LIGHT, to: '#b594ff' }, { from: GREEN_DARK, to: '#5273ce' }],
    },
  },
  {
    file: 'receipt-rupee-silver',
    label: msg('game-labels:sprite.rupeeSilver'),
    category: 'receipt',
    extract: {
      method: 'palette-swap',
      baseFile: 'receipt-rupee-1',
      colors: [{ from: GREEN_LIGHT, to: '#bdbdce' }, { from: GREEN_DARK, to: '#7b7b8c' }],
    },
  },
  {
    file: 'receipt-rupee-gold',
    label: msg('game-labels:sprite.rupeeGold'),
    category: 'receipt',
    extract: {
      method: 'palette-swap',
      baseFile: 'receipt-rupee-1',
      colors: [{ from: GREEN_LIGHT, to: '#ffd639' }, { from: GREEN_DARK, to: '#bd8c21' }],
    },
  },
];

export { RUPEE_SPRITE_DEFINITIONS };
