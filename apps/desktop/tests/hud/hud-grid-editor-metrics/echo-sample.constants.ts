/* @layer tests @kind constants */
import type { EditorSampleState } from '@app/hud-layout-editing/sample-state.type';

const ECHO_SAMPLE: EditorSampleState = {
  live: false,
  slots: [],
  content: {
    vitals: {
      healthCurrent: 24,
      healthCapacity: 24,
      heartMode: 'original',
      armor: 0,
      magic: 0,
      halfMagic: false,
      bombs: 0,
      maxBombs: 0,
      arrows: 0,
      maxArrows: 0,
      keys: 0,
      hasSilverArrows: false,
      rupees: 0,
      maxRupees: 0,
      showMaxInYellow: false,
    },
    slots: {},
    glyph: () => null,
  },
  filledSlots: [],
  hearts: 3,
  dataScope: {},
  view: { w: 398, h: 224 },
  spritesBase: '',
};

export { ECHO_SAMPLE };
