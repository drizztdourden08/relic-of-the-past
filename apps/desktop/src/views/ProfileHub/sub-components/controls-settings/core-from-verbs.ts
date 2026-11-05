/* @layer renderer-components @kind logic */
import type { VerbBindings } from '@drizztdourden08/brock-input';
import type { CoreBindings, InputBinding } from '@rotp/game-data';
import { NONE_BINDING } from './none-binding.constants';

const pick = (verbs: VerbBindings, id: string): InputBinding => verbs[id] ?? NONE_BINDING;

const coreFromVerbs = (verbs: VerbBindings): CoreBindings => ({
  up: pick(verbs, 'up'),
  down: pick(verbs, 'down'),
  left: pick(verbs, 'left'),
  right: pick(verbs, 'right'),
  pause: pick(verbs, 'pause'),
  map: pick(verbs, 'map'),
  confirm: pick(verbs, 'confirm'),
  cancel: pick(verbs, 'cancel'),
  prevScreen: pick(verbs, 'prevScreen'),
  nextScreen: pick(verbs, 'nextScreen'),
});

export { coreFromVerbs };
