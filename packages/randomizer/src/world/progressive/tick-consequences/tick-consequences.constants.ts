/* @layer shared-game @kind constants */
import type { TickConsequence } from '../progressive.type';

const TICK_CONSEQUENCES: readonly TickConsequence[] = [
  {
    field: 'pullableCurtains',
    when: 'noBlade',
    line: {
      term: 'Hanging cloth doors',
      detail: 'nothing can cut one down, so it comes down by facing it, taking hold with A and pulling away.',
    },
  },
  {
    field: 'swordlessMedallions',
    when: 'noBlade',
    line: {
      term: 'Medallion doors',
      detail: 'no blade is in the pool at all, so the medallion alone opens each of the two.',
    },
  },
  {
    field: 'hammerTablets',
    when: 'noBeam',
    line: {
      term: 'Tablets',
      detail: 'no blade in the pool throws a beam, so they wake for the hammer instead.',
    },
  },
  {
    field: 'hammerTowerSeal',
    when: 'noBeam',
    line: {
      term: 'The tower seal',
      detail: 'it throws back anything less than a beam, so with none in the seed a hammer breaks it.',
    },
  },
  {
    field: 'hammerLastFight',
    when: 'noBeam',
    line: {
      term: 'The last fight',
      detail: 'no beam can reach it, so the hammer lands where it is otherwise refused outright.',
    },
  },
];

export { TICK_CONSEQUENCES };
