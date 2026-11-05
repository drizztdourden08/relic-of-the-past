/* @layer renderer-components @kind constants */
import type { VerbDef, VerbGroupDef } from '@drizztdourden08/brock-input/renderer';
import { KEYBOARD_DEFAULT } from '@rotp/input-mapping';
import type { InputBinding, SnesButton } from '@rotp/game-data';

const NONE: InputBinding = { type: 'none' };

const keyboardFor = (button: SnesButton): InputBinding =>
  KEYBOARD_DEFAULT.defaultMappings.find((mapping) => mapping.snesButton === button)?.binding ?? NONE;

const CORE_VERB_DEFS: readonly VerbDef[] = [
  { id: 'up', label: 'Move Up', position: { axis: 'LEFT_Y', direction: '-' }, keyboard: keyboardFor('Up'), claimsSlot: true },
  { id: 'down', label: 'Move Down', position: { axis: 'LEFT_Y', direction: '+' }, keyboard: keyboardFor('Down'), claimsSlot: true },
  { id: 'left', label: 'Move Left', position: { axis: 'LEFT_X', direction: '-' }, keyboard: keyboardFor('Left'), claimsSlot: true },
  { id: 'right', label: 'Move Right', position: { axis: 'LEFT_X', direction: '+' }, keyboard: keyboardFor('Right'), claimsSlot: true },
  { id: 'pause', label: 'Pause', position: 'START', keyboard: keyboardFor('Start'), claimsSlot: true },
  { id: 'map', label: 'Map', position: 'BACK', keyboard: keyboardFor('X'), claimsSlot: true },
  { id: 'confirm', label: 'Confirm', position: 'EAST', keyboard: keyboardFor('A') },
  { id: 'cancel', label: 'Cancel', position: 'SOUTH', keyboard: keyboardFor('B') },
  { id: 'prevScreen', label: 'Previous Screen', position: 'LEFT_SHOULDER', keyboard: keyboardFor('L') },
  { id: 'nextScreen', label: 'Next Screen', position: 'RIGHT_SHOULDER', keyboard: keyboardFor('R') },
];

const CORE_VERB_GROUPS: readonly VerbGroupDef[] = [
  {
    id: 'movement',
    title: 'Movement',
    hint: 'Bind these to the stick to free the whole d-pad for slots.',
    verbs: ['up', 'down', 'left', 'right'],
  },
  { id: 'screens', title: 'Pause & Map', verbs: ['pause', 'map'] },
  {
    id: 'menu',
    title: 'Menu',
    hint: 'These drive the pause menu and are live only while it is open.',
    verbs: ['confirm', 'cancel', 'prevScreen', 'nextScreen'],
  },
];

export { CORE_VERB_DEFS, CORE_VERB_GROUPS };
