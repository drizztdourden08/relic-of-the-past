/* @layer renderer-lib @kind logic */
import type { ControlSchemeId } from '@shared/input/scheme';
import { reseedEdges } from './reseed-edges';
import { schemeRuntime } from './scheme-runtime-state';

const setControlScheme = (scheme: ControlSchemeId, mapOnSelect: boolean): void => {
  if (schemeRuntime.scheme !== scheme) reseedEdges();
  schemeRuntime.scheme = scheme;
  schemeRuntime.mapOnSelect = mapOnSelect;
};

export { setControlScheme };
