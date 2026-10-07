/* @layer renderer-components @kind constants */
/**
 * The ten core verbs, as the controls screen groups and names them.
 *
 * Three groups, because they answer three different questions: where do I
 * walk, what opens the two screens, and what drives the menu once one is
 * open. The menu four are called out explicitly because they are live only while
 * the pause menu is open, so they deliberately do NOT take a button out of
 * circulation (contract §11) and the same physical button can be both a menu
 * verb here and a gameplay slot in the Modern Controls tab.
 */
import type { CoreVerb } from '@shared/input/scheme';

const CORE_VERB_LABELS: Record<CoreVerb, string> = {
  up: 'Move Up',
  down: 'Move Down',
  left: 'Move Left',
  right: 'Move Right',
  pause: 'Pause',
  map: 'Map',
  confirm: 'Confirm',
  cancel: 'Cancel',
  prevScreen: 'Previous Screen',
  nextScreen: 'Next Screen',
};

interface CoreVerbGroup {
  id: string;
  title: string;
  hint?: string;
  verbs: readonly CoreVerb[];
}

const CORE_VERB_GROUPS: readonly CoreVerbGroup[] = [
  {
    id: 'movement',
    title: 'Movement',
    hint: 'Bind these to the stick to free the whole d-pad for slots.',
    verbs: ['up', 'down', 'left', 'right'],
  },
  {
    id: 'screens',
    title: 'Pause & Map',
    verbs: ['pause', 'map'],
  },
  {
    id: 'menu',
    title: 'Menu',
    hint: 'These four drive the pause menu. They are live only while it is open, so each one can also be a gameplay slot.',
    verbs: ['confirm', 'cancel', 'prevScreen', 'nextScreen'],
  },
];

export { CORE_VERB_GROUPS, CORE_VERB_LABELS };
export type { CoreVerbGroup };
