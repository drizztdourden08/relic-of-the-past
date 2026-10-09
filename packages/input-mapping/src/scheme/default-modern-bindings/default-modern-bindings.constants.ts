/* @layer shared-input @kind constants */
import type { SnesButton } from '@rotp/game-data';
import type { InputBinding } from '@rotp/game-data';
import type { CorePosition, CoreVerb } from './default-modern-bindings.type';

const UNBOUND: InputBinding = { type: 'none' };

const DEFAULT_CORE_POSITIONS: Record<CoreVerb, CorePosition> = {
  up: { axis: 'LEFT_Y', direction: '-' },
  down: { axis: 'LEFT_Y', direction: '+' },
  left: { axis: 'LEFT_X', direction: '-' },
  right: { axis: 'LEFT_X', direction: '+' },
  pause: 'START',
  map: 'BACK',
  confirm: 'EAST',
  cancel: 'SOUTH',
  prevScreen: 'LEFT_SHOULDER',
  nextScreen: 'RIGHT_SHOULDER',
};

const KEYBOARD_CORE_SOURCE: Record<CoreVerb, SnesButton> = {
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  pause: 'Start',
  map: 'X',
  confirm: 'A',
  cancel: 'B',
  prevScreen: 'L',
  nextScreen: 'R',
};

const CORE_VERBS = Object.keys(DEFAULT_CORE_POSITIONS) as CoreVerb[];

export { CORE_VERBS, DEFAULT_CORE_POSITIONS, KEYBOARD_CORE_SOURCE, UNBOUND };
