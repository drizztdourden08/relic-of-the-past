/* @layer shared-game @kind logic */
import { compileRule } from '../rule-eval';
import type { Rule } from '../../world.type';

const exitRule = (name: string): Rule => compileRule({ op: 'exit', name });

export { exitRule };
