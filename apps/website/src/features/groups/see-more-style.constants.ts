/* @layer website-site @kind data */
import type { Feature } from '../feature.type';
import { DIALOG_SHOTS as DIALOG } from '../shots/dialog-shots.constants';
import { SEE_MORE_SHOTS as SHOTS } from '../shots/see-more-shots.constants';
import { TITLE_VARIANTS } from '../shots/title-sword-shots.constants';

const SEE_MORE_STYLE_FEATURES: readonly Feature[] = [
    {
      id: 'message-box',
      label: 'Dialog Box',
      short: 'Message box',
      title: 'A modern message box',
      promise: ['Your text, your pace,', 'your style.'],
      body: 'Text speed, hold to hurry it, button prompts and a modern font. Then make the box your own: single, double or no border, any colour, and textures such as the Triforce, scanlines, hexagons and stripes, with outlines to finish. Pick a style under the picture to set it against the original.',
      settings: ['Dialog box', 'Text speed', 'Font', 'Border', 'Texture'],
      caption: "Uncle's message in the original box, against six of the enhanced styles.",
      layout: 'split',
      visual: {
        kind: 'picker',
        labels: ['Original', 'Enhanced'],
        axis: 'x',
        focus: 'bottom',
        options: [
          { id: 'triforce', name: 'Triforce', before: DIALOG.original, after: DIALOG.triforce },
          { id: 'gold', name: 'Double gold', before: DIALOG.original, after: DIALOG.gold },
          { id: 'scanlines', name: 'Scanlines', before: DIALOG.original, after: DIALOG.scanlines },
          { id: 'hex', name: 'Hexagons', before: DIALOG.original, after: DIALOG.hex },
          { id: 'stripes', name: 'Green stripes', before: DIALOG.original, after: DIALOG.stripes },
          { id: 'outline', name: 'Red outline', before: DIALOG.original, after: DIALOG.outline },
        ],
      },
    },
    {
      id: 'title-screen',
      label: 'Title screen',
      short: 'Title screen',
      title: 'A reimagined title screen',
      promise: ['The reflections in the water are real.', 'The background is drawn live.'],
      body: "An optional title scene built from the ROM's own pictures. The background is rendered live, not played back from a recording, and the reflections in the water are real reflections of the scene. All the swords have been redesigned: pick one, and its own loop plays.",
      settings: ['Title screen', 'Sword', 'Motion'],
      caption: 'The reimagined title scene with the four redesigned swords. Pick a sword to see its loop.',
      layout: 'split',
      visual: { kind: 'title', variants: TITLE_VARIANTS },
    },
    {
      id: 'graphical-fixes',
      label: 'Graphical fixes',
      short: 'Graphical fixes',
      title: 'Rupees that match the other games',
      promise: ['Green, blue, red, violet, silver and gold.', 'The colours every other Zelda uses.'],
      body: 'The original drew its big rupees as a green gem with the amount written beside it. The new rupees take the colours of the other Zelda games: violet for 50, silver for 100 and gold for 300. Hover to compare.',
      settings: ['Rupees'],
      caption: 'The original rupees, then the new ones: 1, 5, 20, 50, 100 and 300.',
      layout: 'split',
      visual: {
        kind: 'compare',
        before: SHOTS['rupees-original'],
        after: SHOTS['rupees-fixed'],
        labels: ['Original', 'New rupees'],
        axis: 'x',
      },
    },
];

export { SEE_MORE_STYLE_FEATURES };
