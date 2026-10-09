/* @layer shared-input @kind logic */
import { CORE_VERBS } from './default-modern-bindings.constants';
import type { CoreBindings, InputBinding } from '@rotp/game-data';
import type { CoreVerb } from './default-modern-bindings.type';

const buildCore = (bindingFor: (verb: CoreVerb) => InputBinding): CoreBindings => {
  const core = {} as CoreBindings;
  for (const verb of CORE_VERBS) core[verb] = bindingFor(verb);
  return core;
};

export { buildCore };
