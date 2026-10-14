/* @layer renderer-components @kind logic */
import type { CoreBindings } from '@rotp/game-data';
import type { InputProfile } from '@rotp/input-mapping';

const profileWithCoreBindings = (profile: InputProfile, core: CoreBindings): InputProfile => ({
  ...profile,
  core,
  ...(profile.modern ? { modern: { ...profile.modern, core } } : {}),
  modifiedAt: Date.now(),
});

export { profileWithCoreBindings };
