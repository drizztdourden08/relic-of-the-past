/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { VerbDef, VerbGroupDef } from '@drizztdourden08/brock-input/renderer';
import { KEYBOARD_DEFAULT } from '@rotp/input-mapping';
import type { InputBinding, SnesButton } from '@rotp/game-data';

const NONE: InputBinding = { type: 'none' };

const keyboardFor = (button: SnesButton): InputBinding =>
  KEYBOARD_DEFAULT.defaultMappings.find((mapping) => mapping.snesButton === button)?.binding ?? NONE;

const coreVerbDefs = (t: I18n['t']): readonly VerbDef[] => [
  { id: 'up', label: t('profiles:controls.verbs.up'), position: { axis: 'LEFT_Y', direction: '-' }, keyboard: keyboardFor('Up'), claimsSlot: true },
  { id: 'down', label: t('profiles:controls.verbs.down'), position: { axis: 'LEFT_Y', direction: '+' }, keyboard: keyboardFor('Down'), claimsSlot: true },
  { id: 'left', label: t('profiles:controls.verbs.left'), position: { axis: 'LEFT_X', direction: '-' }, keyboard: keyboardFor('Left'), claimsSlot: true },
  { id: 'right', label: t('profiles:controls.verbs.right'), position: { axis: 'LEFT_X', direction: '+' }, keyboard: keyboardFor('Right'), claimsSlot: true },
  { id: 'pause', label: t('profiles:controls.verbs.pause'), position: 'START', keyboard: keyboardFor('Start'), claimsSlot: true },
  { id: 'map', label: t('profiles:controls.verbs.map'), position: 'BACK', keyboard: keyboardFor('X'), claimsSlot: true },
  { id: 'confirm', label: t('profiles:controls.verbs.confirm'), position: 'EAST', keyboard: keyboardFor('A') },
  { id: 'cancel', label: t('profiles:controls.verbs.cancel'), position: 'SOUTH', keyboard: keyboardFor('B') },
  { id: 'prevScreen', label: t('profiles:controls.verbs.prev-screen'), position: 'LEFT_SHOULDER', keyboard: keyboardFor('L') },
  { id: 'nextScreen', label: t('profiles:controls.verbs.next-screen'), position: 'RIGHT_SHOULDER', keyboard: keyboardFor('R') },
];

const coreVerbGroups = (t: I18n['t']): readonly VerbGroupDef[] => [
  {
    id: 'movement',
    title: t('profiles:controls.groups.movement.title'),
    hint: t('profiles:controls.groups.movement.hint'),
    verbs: ['up', 'down', 'left', 'right'],
  },
  { id: 'screens', title: t('profiles:controls.groups.screens.title'), verbs: ['pause', 'map'] },
  {
    id: 'menu',
    title: t('profiles:controls.groups.menu.title'),
    hint: t('profiles:controls.groups.menu.hint'),
    verbs: ['confirm', 'cancel', 'prevScreen', 'nextScreen'],
  },
];

export { coreVerbDefs, coreVerbGroups };
