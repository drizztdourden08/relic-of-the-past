/* @layer renderer-components @kind logic */
import { LAYER_ID } from './portal-layer.constants';

const hasOpenDropdown = (): boolean => {
  const layer = document.getElementById(LAYER_ID);
  return layer !== null && layer.childElementCount > 0;
};

export { hasOpenDropdown };
