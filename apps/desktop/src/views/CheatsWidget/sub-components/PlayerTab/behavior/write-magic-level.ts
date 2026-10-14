/* @layer renderer-widgets @kind logic */
import { cheatSetMagic } from '@app/game';
import { MAGIC_UNITS_PER_LEVEL } from '../PlayerTab.constants';

const writeMagicLevel = (level: number): void => cheatSetMagic(level * MAGIC_UNITS_PER_LEVEL);

export { writeMagicLevel };
