/* @layer renderer-components @kind logic */
import type { ActionBinding } from '@drizztdourden08/brock-input';
import type { ButtonMapping } from '@rotp/game-data';

const toActionBinding = (mapping: ButtonMapping): ActionBinding => ({
  action: mapping.snesButton,
  binding: mapping.binding,
  icon: mapping.icon,
  sourceVid: mapping.sourceVid,
  sourcePid: mapping.sourcePid,
});

const toBrockMappings = (mappings: readonly ButtonMapping[]): ActionBinding[] => mappings.map(toActionBinding);

export { toBrockMappings };
