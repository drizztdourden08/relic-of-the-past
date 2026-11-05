/* @layer renderer-components @kind logic */
import type { VerbBindings } from '@drizztdourden08/brock-input';
import type { CoreBindings, InputBinding } from '@rotp/game-data';

const NONE: InputBinding = { type: 'none' };

const pick = (verbs: VerbBindings, id: string): InputBinding => verbs[id] ?? NONE;

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

const verbsFromCore = (core: CoreBindings): VerbBindings => Object.fromEntries(Object.entries(core));

export { coreFromVerbs, verbsFromCore };
