/* @layer shared-hud @kind constants */
import type { Band, BandPair } from './migrate-screen.type';

const BANDS: Record<string, BandPair> = {
  'top-left': { x: 'start', y: 'start' },
  'top-center': { x: 'center', y: 'start' },
  'top-right': { x: 'end', y: 'start' },
  'mid-left': { x: 'start', y: 'center' },
  center: { x: 'center', y: 'center' },
  'mid-right': { x: 'end', y: 'center' },
  'bottom-left': { x: 'start', y: 'end' },
  'bottom-center': { x: 'center', y: 'end' },
  'bottom-right': { x: 'end', y: 'end' },
};

const INDEX: Record<Band, number> = { start: 1, center: 2, end: 3 };

const ITEMS: Record<string, string> = { start: 'start', center: 'center', end: 'end', between: 'start' };

const SCREEN_GRID = {
  layout: 'grid',
  columns: ['auto', 'fill', 'auto'],
  rows: ['auto', 'fill', 'auto'],
  justifyItems: 'start',
  alignItems: 'start',
};

export { BANDS, INDEX, ITEMS, SCREEN_GRID };
