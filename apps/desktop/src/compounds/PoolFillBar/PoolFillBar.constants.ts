/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { SegmentEntry } from './PoolFillBar.type';

const SEGMENTS: readonly SegmentEntry[] = [
  { key: 'items', color: 'secondary', label: msg('compounds:pool-fill-bar.items.label'), description: msg('compounds:pool-fill-bar.items.description') },
  { key: 'upgrades', color: 'violet', label: msg('compounds:pool-fill-bar.upgrades.label'), description: msg('compounds:pool-fill-bar.upgrades.description') },
  { key: 'filler', color: 'warning', label: msg('compounds:pool-fill-bar.filler.label'), description: msg('compounds:pool-fill-bar.filler.description') },
  { key: 'fixed', color: 'danger', label: msg('compounds:pool-fill-bar.fixed.label'), description: msg('compounds:pool-fill-bar.fixed.description') },
  { key: 'prizes', color: 'info', label: msg('compounds:pool-fill-bar.prizes.label'), description: msg('compounds:pool-fill-bar.prizes.description') },
];

export { SEGMENTS };
