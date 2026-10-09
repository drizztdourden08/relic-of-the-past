/* @layer renderer-lib @kind logic */
import { setControlScheme } from './set-control-scheme';
import { schemeRuntime } from './scheme-runtime-state';

const setMapOnSelect = (mapOnSelect: boolean): void => {
  setControlScheme(schemeRuntime.scheme, mapOnSelect);
};

export { setMapOnSelect };
