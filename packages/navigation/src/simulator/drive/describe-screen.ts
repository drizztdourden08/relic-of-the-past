/* @layer bridge-wasm @kind logic */
import { displayNameFor } from '../screen-name';
import { locationForScreen } from '../screen-location';
import type { PathStep } from './drive.type';

const screenIndexOf = (loc: ReturnType<typeof locationForScreen>): number => {
  if (!loc) return -1;
  return loc.isIndoors ? loc.roomId : loc.owScreenIndex;
};

const describeScreen = (screenId: string): Omit<PathStep, 'observed'> => {
  const loc = locationForScreen(screenId);
  return {
    screenId,
    name: displayNameFor(screenId),
    indoors: loc?.isIndoors ?? true,
    index: screenIndexOf(loc),
  };
};

export { describeScreen };
