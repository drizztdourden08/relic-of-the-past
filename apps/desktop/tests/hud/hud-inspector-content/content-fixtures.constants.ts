/* @layer tests @kind constants */
import type { GlyphPack } from '@rotp/input-mapping';
import type { ModernSlot } from '@rotp/game-data';

const PACKS: readonly GlyphPack[] = [{
  id: 'generic',
  name: 'Generic',
  builtIn: true,
  glyphs: {
    SOUTH: { kind: 'built-in', assetPath: 'buttons/generic/south.svg' },
    EAST: { kind: 'built-in', assetPath: 'buttons/generic/east.svg' },
  },
}];

const SLOTS: readonly ModernSlot[] = [1, 2, 3, 4].map((index) => ({
  index, binding: { type: 'none' }, label: `Slot ${index}`, position: index === 1 ? 'SOUTH' : 'EAST',
}));

const SCOPE = { life_current: 112, life_max: 160, item: 4, index: 0, count: 20 };

export { PACKS, SCOPE, SLOTS };
