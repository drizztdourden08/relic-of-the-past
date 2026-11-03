/* @layer renderer-components @kind logic */
import { bindSnesButton } from './bind-snes-button';
import { NO_BINDING } from './controls-settings.constants';
import type { InputProfile } from '@rotp/input-mapping';
import type { ClearSnesMappingParams } from './controls-settings.type';

const clearSnesMapping = ({ profile, button, mappingIndex }: ClearSnesMappingParams): InputProfile => {
  const sharesButton = profile.mappings.filter(m => m.snesButton === button).length > 1;
  if (!sharesButton) return bindSnesButton({ profile, button, binding: NO_BINDING, vid: null, pid: null });
  return {
    ...profile,
    mappings: profile.mappings.filter((_, index) => index !== mappingIndex),
    modifiedAt: Date.now(),
  };
};

export { clearSnesMapping };
