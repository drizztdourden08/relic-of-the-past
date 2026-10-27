/* @layer website-site @kind constants */
import type { IconName, IconShape } from './Icon.type';

const ICON_VIEW_BOX = '0 0 24 24';
const ICON_DEFAULT_SIZE = 16;
const ICON_STROKE_WIDTH = 2;

const ICON_SHAPES: Record<IconName, IconShape> = {
  download: { paths: ['M12 15V3m9 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10l5 5l5-5'] },
  github: {
    paths: [
      'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5c.08-1.25-.27-2.48-1-3.5c.28-1.15.28-2.35 0-3.5c0 0-1 0-3 1.5c-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5c-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4',
      'M9 18c-4.51 2-5-2-7-2',
    ],
  },
  star: {
    paths: [
      'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z',
    ],
  },
  'git-fork': {
    paths: ['M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9m6 3v3'],
    circles: [
      { cx: 12, cy: 18, r: 3 },
      { cx: 6, cy: 6, r: 3 },
      { cx: 18, cy: 6, r: 3 },
    ],
  },
  'circle-dot': {
    paths: [],
    circles: [
      { cx: 12, cy: 12, r: 10 },
      { cx: 12, cy: 12, r: 1 },
    ],
  },
  'external-link': { paths: ['M15 3h6v6m-11 5L21 3m-3 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'] },
};

export { ICON_DEFAULT_SIZE, ICON_SHAPES, ICON_STROKE_WIDTH, ICON_VIEW_BOX };
