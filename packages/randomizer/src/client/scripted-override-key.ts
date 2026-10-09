/* @layer bridge-wasm @kind logic */
import { getCheck } from '@rotp/game-data';
import { SCRIPTED_SURFACE_BY_CHECK } from './scripted-override-key.constants';
import type { CheckId } from '@rotp/game-data';
import type { ScriptedGrantSurface } from '../scripted-grant-overrides/scripted-grant-overrides.type';

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
