/* @layer renderer-hud @kind constants */
import type { HeartTint } from './HudHeart.type';

const HEART_TILE = 8;

const HEART_VIEW = 16;

const HEART_PATH =
  'M8 14.4C8 14.4 1.6 10.2 1.6 6.1C1.6 3.6 3.5 2 5.5 2C6.7 2 7.6 2.6 8 3.4'
  + 'C8.4 2.6 9.3 2 10.5 2C12.5 2 14.4 3.6 14.4 6.1C14.4 10.2 8 14.4 8 14.4Z';

const HEART_SHADE_PATH =
  'M8 14.4C8 14.4 14.4 10.2 14.4 6.1C14.4 3.6 12.5 2 10.5 2C9.3 2 8.4 2.6 8 3.4Z';

const HEART_HIGHLIGHT_PATH =
  'M4 5.6C4.2 4.3 5.2 3.4 6.4 3.5C6.9 3.6 7.3 3.8 7.5 4.1'
  + 'C6.2 4.5 5.2 5.5 4.9 6.9C4.3 6.7 3.9 6.2 4 5.6Z';

const HEART_FILL = '#e0283c';
const HEART_EMPTY = '#3a1119';
const HEART_OUTLINE = '#140407';

const HEART_OUTLINE_WIDTH = 1.4;
const HEART_RIM_WIDTH = 1.2;

const HEART_RIM_OPACITY = 0.9;
const HEART_HIGHLIGHT_OPACITY = 0.9;
const HEART_SHADE_OPACITY = 0.55;

const HEART_FILL_MS = 200;

const HEART_TINTS: readonly HeartTint[] = [
  { rim: '#ffd6dc', highlight: '#fff6f7', shade: '#98192c' },
  { rim: '#b4c6dc', highlight: '#e4eefb', shade: '#7c2140' },
  { rim: '#e6b445', highlight: '#ffe9a2', shade: '#a53a12' },
];

export {
  HEART_EMPTY,
  HEART_FILL,
  HEART_FILL_MS,
  HEART_HIGHLIGHT_OPACITY,
  HEART_HIGHLIGHT_PATH,
  HEART_OUTLINE,
  HEART_OUTLINE_WIDTH,
  HEART_PATH,
  HEART_RIM_OPACITY,
  HEART_RIM_WIDTH,
  HEART_SHADE_OPACITY,
  HEART_SHADE_PATH,
  HEART_TILE,
  HEART_TINTS,
  HEART_VIEW,
};
