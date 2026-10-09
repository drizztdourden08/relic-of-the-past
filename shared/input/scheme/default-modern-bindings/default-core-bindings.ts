/* @layer shared-input @kind logic */
import { bindingForPosition } from './binding-for-position';
import { buildCore } from './build-core';
import { DEFAULT_CORE_POSITIONS } from './default-modern-bindings.constants';
import type { ResolvedControl } from '../../family/family.type';
import type { CoreBindings } from '@rotp/game-data';

const defaultCoreBindings = (controls: readonly ResolvedControl[]): CoreBindings => {
  const byPosition = new Map<string, ResolvedControl>(controls.map(control => [control.position, control]));
  return buildCore(verb => bindingForPosition(DEFAULT_CORE_POSITIONS[verb], byPosition));
};

export { defaultCoreBindings };
