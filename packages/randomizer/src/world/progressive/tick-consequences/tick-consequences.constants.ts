/* @layer shared-game @kind data */
import type { TickConsequence } from '../progressive.type';

const TICK_CONSEQUENCES: readonly TickConsequence[] = [
  {
    field: 'pullableCurtains',
    when: 'noBlade',
    line: { term: { key: 'randomizer:tick.pullable-curtains.term' }, detail: { key: 'randomizer:tick.pullable-curtains.detail' } },
  },
  {
    field: 'swordlessMedallions',
    when: 'noBlade',
    line: { term: { key: 'randomizer:tick.swordless-medallions.term' }, detail: { key: 'randomizer:tick.swordless-medallions.detail' } },
  },
  {
    field: 'hammerTablets',
    when: 'noBeam',
    line: { term: { key: 'randomizer:tick.hammer-tablets.term' }, detail: { key: 'randomizer:tick.hammer-tablets.detail' } },
  },
  {
    field: 'hammerTowerSeal',
    when: 'noBeam',
    line: { term: { key: 'randomizer:tick.hammer-tower-seal.term' }, detail: { key: 'randomizer:tick.hammer-tower-seal.detail' } },
  },
  {
    field: 'hammerLastFight',
    when: 'noBeam',
    line: { term: { key: 'randomizer:tick.hammer-last-fight.term' }, detail: { key: 'randomizer:tick.hammer-last-fight.detail' } },
  },
];

export { TICK_CONSEQUENCES };
