/* @layer shared-types @kind types */
import type { ButtonIcon, InputBinding } from '@rotp/game-data';
import type { FUNCTION_ACTIONS } from './functions.constants';

type FunctionAction = (typeof FUNCTION_ACTIONS)[number];

interface FunctionMapping {
  action: FunctionAction;
  binding: InputBinding;
  icon: ButtonIcon | null;
  sourceVid?: string | null;
  sourcePid?: string | null;
}

export type { FunctionAction, FunctionMapping };
