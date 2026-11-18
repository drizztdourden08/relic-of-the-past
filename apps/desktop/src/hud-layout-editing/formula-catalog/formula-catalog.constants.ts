/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { FormulaName } from './formula-catalog.type';

const SCOPE_NOTES: Readonly<Record<'index' | 'count' | 'item', Message>> = {
  index: msg('hud-editing:catalog.scope.index'),
  count: msg('hud-editing:catalog.scope.count'),
  item: msg('hud-editing:catalog.scope.item'),
};

const OUTSIDE_REPEAT = msg('hud-editing:catalog.outside-repeat');
const NOT_A_TRANSITION = msg('hud-editing:catalog.not-a-transition');

const DELTA_NOTE = msg('hud-editing:catalog.delta');

const OPERATORS: readonly FormulaName[] = [
  { name: '+ − * / %', note: msg('hud-editing:catalog.op.arithmetic') },
  { name: '== != < <= > >=', note: msg('hud-editing:catalog.op.compare') },
  { name: 'and', note: msg('hud-editing:catalog.op.and') },
  { name: 'or', note: msg('hud-editing:catalog.op.or') },
  { name: 'not', note: msg('hud-editing:catalog.op.not') },
  { name: 'if(test, then, else)', note: msg('hud-editing:catalog.op.if') },
];

const FUNCTIONS: readonly FormulaName[] = [
  { name: 'ceil', note: msg('hud-editing:catalog.fn.ceil') },
  { name: 'floor', note: msg('hud-editing:catalog.fn.floor') },
  { name: 'round', note: msg('hud-editing:catalog.fn.round') },
  { name: 'trunc', note: msg('hud-editing:catalog.fn.trunc') },
  { name: 'roundTo(x, dp)', note: msg('hud-editing:catalog.fn.round-to') },
  { name: 'abs', note: msg('hud-editing:catalog.fn.abs') },
  { name: 'sign', note: msg('hud-editing:catalog.fn.sign') },
  { name: 'min(...)', note: msg('hud-editing:catalog.fn.min') },
  { name: 'max(...)', note: msg('hud-editing:catalog.fn.max') },
  { name: 'sqrt', note: msg('hud-editing:catalog.fn.sqrt') },
  { name: 'pow(a, b)', note: msg('hud-editing:catalog.fn.pow') },
];

const CONSTANTS: readonly FormulaName[] = [
  { name: 'PI', note: msg('hud-editing:catalog.const.pi') },
  { name: 'E', note: msg('hud-editing:catalog.const.e') },
  { name: 'true / false', note: msg('hud-editing:catalog.const.bool') },
];

export { CONSTANTS, DELTA_NOTE, FUNCTIONS, NOT_A_TRANSITION, OPERATORS, OUTSIDE_REPEAT, SCOPE_NOTES };
