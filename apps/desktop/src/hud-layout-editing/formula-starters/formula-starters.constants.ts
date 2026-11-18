/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { fractionStarters } from './fraction-starters';
import type { FormulaStarter } from './formula-starters.type';

const CONTAINER_SIZE = 8;

const NUMBER_STARTERS: readonly FormulaStarter[] = [
  {
    title: msg('hud-editing:starter.containers'),
    expr: `ceil(life_max / ${CONTAINER_SIZE})`,
    select: 'life_max',
  },
  ...fractionStarters(),
];

const REPEAT_NUMBER_STARTERS: readonly FormulaStarter[] = [
  {
    title: msg('hud-editing:starter.slice'),
    expr: `min(max(life_current - index * ${CONTAINER_SIZE}, 0), ${CONTAINER_SIZE}) / ${CONTAINER_SIZE}`,
    select: 'life_current',
  },
  { title: msg('hud-editing:starter.stagger'), expr: 'index * 80', select: '80' },
];

const GATE_STARTERS: readonly FormulaStarter[] = [
  { title: msg('hud-editing:starter.above-zero'), expr: 'arrow_current > 0', select: 'arrow_current' },
  { title: msg('hud-editing:starter.owned'), expr: 'silver_arrows > 0', select: 'silver_arrows' },
  {
    title: msg('hud-editing:starter.both'),
    expr: 'arrow_current > 0 and silver_arrows > 0',
    select: 'arrow_current',
  },
];

const REPEAT_GATE_STARTERS: readonly FormulaStarter[] = [
  { title: msg('hud-editing:starter.last'), expr: 'index == count - 1' },
  { title: msg('hud-editing:starter.empty'), expr: 'item < 1' },
];

export {
  GATE_STARTERS,
  NUMBER_STARTERS,
  REPEAT_GATE_STARTERS,
  REPEAT_NUMBER_STARTERS,
};
