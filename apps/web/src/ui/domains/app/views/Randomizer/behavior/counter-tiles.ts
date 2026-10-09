/* @layer renderer-components @kind logic */
import type { StatTileProps } from '@ds/primitives';
import { COUNTER_LABELS } from './counter-tiles.constants';

const humanize = (key: string): string =>
  key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();

const counterTilesOf = (stats: object | null): StatTileProps[] =>
  (stats === null ? [] : Object.entries(stats).map(([key, count]) => ({
    label: COUNTER_LABELS[key] ?? humanize(key),
    value: String(count),
  })));

export { counterTilesOf };
