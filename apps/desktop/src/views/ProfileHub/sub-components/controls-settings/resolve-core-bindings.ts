/* @layer renderer-components @kind logic */
import { defaultCoreBindings, keyboardModernBindings } from '@rotp/input-mapping';
import type { CoreBindings } from '@rotp/game-data';
import type { ResolveCoreBindingsParams } from './controls-settings.type';

const resolveCoreBindings = ({ activeProfile, controls, isKeyboard }: ResolveCoreBindingsParams): CoreBindings => {
  if (activeProfile?.core) return activeProfile.core;
  if (activeProfile?.modern?.core) return activeProfile.modern.core;
  return isKeyboard ? keyboardModernBindings().core : defaultCoreBindings(controls);
};

export { resolveCoreBindings };
