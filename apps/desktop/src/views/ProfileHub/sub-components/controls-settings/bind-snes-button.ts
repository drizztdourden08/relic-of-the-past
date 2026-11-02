/* @layer renderer-components @kind logic */
import { bindMapping } from './bind-mapping';
import type { InputProfile } from '@rotp/input-mapping';
import type { BindSnesButtonParams } from './controls-settings.type';

const bindSnesButton = ({ profile, button, binding, vid, pid }: BindSnesButtonParams): InputProfile => {
  const firstIndex = profile.mappings.findIndex(m => m.snesButton === button);
  return {
    ...profile,
    mappings: profile.mappings
      .map((m, index) => (index === firstIndex ? bindMapping({ mapping: m, binding, vid, pid }) : m))
      .filter((m, index) => m.snesButton !== button || index === firstIndex),
    modifiedAt: Date.now(),
  };
};

export { bindSnesButton };
