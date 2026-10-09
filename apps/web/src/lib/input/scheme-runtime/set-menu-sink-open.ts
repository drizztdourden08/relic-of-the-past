/* @layer renderer-lib @kind logic */
import { reseedEdges } from './reseed-edges';
import { schemeRuntime } from './scheme-runtime-state';

const setMenuSinkOpen = (open: boolean): void => {
  if (schemeRuntime.menuSink.open === open) return;
  schemeRuntime.menuSink.open = open;
  reseedEdges();
};

export { setMenuSinkOpen };
