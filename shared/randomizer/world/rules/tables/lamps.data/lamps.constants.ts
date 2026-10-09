/* @layer shared-game @kind constants */
import { canCrossDarkRoom } from '../../../dark-rooms/can-cross-dark-room';
import { compileRule } from '../../rule-eval';
import { any, option } from '../../rule-node-build';
import { ESCAPE_DARK_EXITS, ESCAPE_DARK_LOCATIONS, LAMP_EXITS, LAMP_LOCATIONS } from './lamp-spots.data';
import { exitRow } from './exit-row';
import { locationRow } from './location-row';
import type { Rule } from '../../../world.type';
import type { RuleEntry } from '../../rule-entry.type';

const CAN_CROSS_ESCAPE_DARK_ROOM: Rule = compileRule(any(option('unlitEscapeExempt', true), canCrossDarkRoom.node));

const LAMP_RULES: readonly RuleEntry[] = [
  ...LAMP_EXITS.map(exitRow(canCrossDarkRoom)),
  ...LAMP_LOCATIONS.map(locationRow(canCrossDarkRoom)),
  ...ESCAPE_DARK_EXITS.map(exitRow(CAN_CROSS_ESCAPE_DARK_ROOM)),
  ...ESCAPE_DARK_LOCATIONS.map(locationRow(CAN_CROSS_ESCAPE_DARK_ROOM)),
];

export { LAMP_RULES };
