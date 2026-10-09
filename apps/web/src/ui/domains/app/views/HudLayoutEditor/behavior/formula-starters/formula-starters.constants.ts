/* @layer renderer-components @kind constants */
import { fractionStarters } from './fraction-starters';
import type { FormulaStarter } from './formula-starters.type';

const CONTAINER_SIZE = 8;

const NUMBER_STARTERS: readonly FormulaStarter[] = [
  {
    title: 'how many containers a capacity is worth',
    expr: `ceil(life_max / ${CONTAINER_SIZE})`,
    select: 'life_max',
  },
  ...fractionStarters(),
];

const REPEAT_NUMBER_STARTERS: readonly FormulaStarter[] = [
  {
    title: "this instance's slice of a total",
    expr: `min(max(life_current - index * ${CONTAINER_SIZE}, 0), ${CONTAINER_SIZE}) / ${CONTAINER_SIZE}`,
    select: 'life_current',
  },
  { title: 'a stagger, in milliseconds per instance', expr: 'index * 80', select: '80' },
];

const GATE_STARTERS: readonly FormulaStarter[] = [
  { title: 'a value is above zero', expr: 'arrow_current > 0', select: 'arrow_current' },
  { title: 'an upgrade is owned', expr: 'silver_arrows > 0', select: 'silver_arrows' },
  {
    title: 'two things at once, joined by and instead of &&',
    expr: 'arrow_current > 0 and silver_arrows > 0',
    select: 'arrow_current',
  },
];

const REPEAT_GATE_STARTERS: readonly FormulaStarter[] = [
  { title: 'this is the last instance', expr: 'index == count - 1' },
  { title: 'this instance is empty', expr: 'item < 1' },
];

export {
  CONTAINER_SIZE, GATE_STARTERS, NUMBER_STARTERS, REPEAT_GATE_STARTERS, REPEAT_NUMBER_STARTERS,
};
