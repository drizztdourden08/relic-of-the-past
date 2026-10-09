/* @layer bridge-wasm @kind logic */
import { getCheck } from '@shared/game/data';
import { SCRIPTED_SURFACE_BY_CHECK } from './scripted-override-key.constants';
import type { CheckId } from '@shared/game/data';
import type { ScriptedGrantSurface } from '../scripted-grant-overrides';

const assertCheckInDataset = (checkId: CheckId): void => {
  getCheck(checkId);
};

const scriptedOverrideKeyOf = (checkId: CheckId): ScriptedGrantSurface | null => {
  const surface = SCRIPTED_SURFACE_BY_CHECK.get(checkId);
  if (surface === undefined) return null;
  assertCheckInDataset(checkId);
  return surface;
};

export { scriptedOverrideKeyOf };
