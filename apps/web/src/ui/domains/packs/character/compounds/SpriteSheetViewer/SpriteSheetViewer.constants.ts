/* @layer renderer-components @kind data */
import type { SegmentOption } from '@ds/primitives';
import type { SheetView } from './SpriteSheetViewer.type';

const VIEW_OPTIONS: SegmentOption<SheetView>[] = [
  { value: 'state', label: 'One state' },
  { value: 'contact', label: 'All states' },
  { value: 'sheet', label: 'Tile sheet' },
];

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const DEFAULT_SCALE = 3;

/** The bunny state: its art has no palette of its own, so picking it moves the outfit too. */
const BUNNY_ACTION = 0x21;

export { VIEW_OPTIONS, MIN_SCALE, MAX_SCALE, DEFAULT_SCALE, BUNNY_ACTION };
