/* @layer website-site @kind data */
import type { Feature } from '../feature.type';
import { DIALOG_SHOTS as DIALOG } from '../shots/dialog-shots.constants';
import { TITLE_VARIANTS } from '../shots/title-sword-shots.constants';
import { GRAPHICAL_FIXES_FEATURE } from './graphical-fixes.constants';

const SEE_MORE_STYLE_FEATURES: readonly Feature[] = [
  {
    id: 'message-box',
    label: 'Dialog Box',
    short: 'Message box',
    title: 'A modern message box',
    promise: ['Your text, your pace,', 'your style.'],
    body: 'Faster text, button prompts and a modern font. Then pick a style for the box.',
    settings: ['Dialog box', 'Text speed', 'Font', 'Border', 'Texture'],
    caption: "Uncle's message in the original box, then in the new styles.",
    layout: 'split',
    visual: {
      kind: 'picker',
      labels: ['Original', 'Enhanced'],
      axis: 'x',
      focus: 'bottom',
      options: [
        {
          id: 'triforce',
          name: 'Default',
          before: DIALOG.original,
          after: DIALOG.triforce,
          clips: {
            before: { src: 'media/shots/dialog-original.mp4', poster: DIALOG.original },
            after: { src: 'media/shots/dialog-triforce.mp4', poster: DIALOG.triforce },
          },
        },
        {
          id: 'gold',
          name: 'Double gold',
          before: DIALOG.original,
          after: DIALOG.gold,
          clips: {
            before: { src: 'media/shots/dialog-original.mp4', poster: DIALOG.original },
            after: { src: 'media/shots/dialog-gold.mp4', poster: DIALOG.gold },
          },
        },
        {
          id: 'scanlines',
          name: 'Scanlines',
          before: DIALOG.original,
          after: DIALOG.scanlines,
          clips: {
            before: { src: 'media/shots/dialog-original.mp4', poster: DIALOG.original },
            after: { src: 'media/shots/dialog-scanlines.mp4', poster: DIALOG.scanlines },
          },
        },
        {
          id: 'hex',
          name: 'Hexagons',
          before: DIALOG.original,
          after: DIALOG.hex,
          clips: {
            before: { src: 'media/shots/dialog-original.mp4', poster: DIALOG.original },
            after: { src: 'media/shots/dialog-hex.mp4', poster: DIALOG.hex },
          },
        },
        {
          id: 'stripes',
          name: 'Green stripes',
          before: DIALOG.original,
          after: DIALOG.stripes,
          clips: {
            before: { src: 'media/shots/dialog-original.mp4', poster: DIALOG.original },
            after: { src: 'media/shots/dialog-stripes.mp4', poster: DIALOG.stripes },
          },
        },
        {
          id: 'outline',
          name: 'Red outline',
          before: DIALOG.original,
          after: DIALOG.outline,
          clips: {
            before: { src: 'media/shots/dialog-original.mp4', poster: DIALOG.original },
            after: { src: 'media/shots/dialog-outline.mp4', poster: DIALOG.outline },
          },
        },
      ],
    },
  },
  {
    id: 'title-screen',
    label: 'Title screen',
    short: 'Title screen',
    title: 'A reimagined title screen',
    promise: ['The reflections in the water are real.', 'The background is drawn live.'],
    body: "An optional title scene built from the ROM's own pictures. Every sword has been redrawn, and each one has its own loop.",
    settings: ['Title screen', 'Sword', 'Motion'],
    caption: 'The new title scene. Pick a sword to see its loop.',
    layout: 'split',
    visual: { kind: 'title', variants: TITLE_VARIANTS },
  },
  GRAPHICAL_FIXES_FEATURE,
];

export { SEE_MORE_STYLE_FEATURES };
