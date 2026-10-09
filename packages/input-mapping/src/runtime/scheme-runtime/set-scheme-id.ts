/* @layer renderer-lib @kind logic */
import type { ControlSchemeId } from '../../scheme';
import { setControlScheme } from './set-control-scheme';
import { schemeRuntime } from './scheme-runtime-state';

const setSchemeId = (scheme: ControlSchemeId): void => {
  setControlScheme(scheme, schemeRuntime.mapOnSelect);
};

export { setSchemeId };
