/* @layer renderer-components @kind logic */
import type { VerbBindings } from '@drizztdourden08/brock-input';
import type { CoreBindings } from '@rotp/game-data';

const verbsFromCore = (core: CoreBindings): VerbBindings => Object.fromEntries(Object.entries(core));

export { verbsFromCore };
