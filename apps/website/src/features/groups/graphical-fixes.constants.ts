/* @layer website-site @kind data */
import type { Feature } from '../feature.type';
import type { PickerOption } from '../feature-visual.type';
import { GRAPHICS_SHOTS as G } from '../shots/graphics-shots.constants';

const GRAPHICAL_FIXES_OPTIONS: readonly [PickerOption, ...PickerOption[]] = [
  { id: 'rupees', name: 'Rupees', before: G['rupees-off'], after: G['rupees-on'] },
  {
    id: 'sheen',
    name: 'Item sheen',
    before: G['sheen-off'],
    after: G['sheen-on'],
    clips: {
      before: { src: 'media/shots/gfx-sheen-off.mp4', poster: G['sheen-off'] },
      after: { src: 'media/shots/gfx-sheen-on.mp4', poster: G['sheen-on'] },
    },
  },
  { id: 'bunny-map', name: 'Bunny colours', before: G['bunny-map-off'], after: G['bunny-map-on'] },
];

const GRAPHICAL_FIXES_FEATURE: Feature = {
  id: 'graphical-fixes',
  label: 'Graphical fixes',
  short: 'Graphical fixes',
  title: 'Graphics that look right',
  promise: ['Small things that look right.', 'Rupees are just one of them.'],
  body: 'A few little visual fixes, like rupees in the colours of the other Zelda games.',
  settings: ['Rupees', 'Sheen', 'Bunny'],
  caption: 'Each fix, off and on.',
  layout: 'split',
  visual: {
    kind: 'picker',
    labels: ['Original', 'Fixed'],
    axis: 'x',
    focus: 'center',
    options: GRAPHICAL_FIXES_OPTIONS,
  },
};

export { GRAPHICAL_FIXES_FEATURE };
