/* @layer bridge-wasm @kind logic */
import { originContaining } from './origin-containing';
import { overworldOrigin } from './overworld-origin';

const screenOriginFor = (
  args: { isIndoors: boolean; linkX: number; linkY: number; screenIndex: number },
): { x: number; y: number } => {
  const { isIndoors, linkX, linkY, screenIndex } = args;
  return isIndoors ? originContaining(linkX, linkY) : overworldOrigin(screenIndex);
};

export { screenOriginFor };
