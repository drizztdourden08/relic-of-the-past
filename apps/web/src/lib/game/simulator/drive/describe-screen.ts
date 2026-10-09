/* @layer bridge-wasm @kind logic */
import { displayNameFor } from '../screen-name';
import { locationForScreen } from '../screen-location';
import type { PathStep } from './drive.type';

const describeScreen = (screenId: string): Omit<PathStep, 'observed'> => {
  const loc = locationForScreen(screenId);
  return {
    screenId,
    name: displayNameFor(screenId),
    indoors: loc?.isIndoors ?? true,
    index: loc ? (loc.isIndoors ? loc.roomId : loc.owScreenIndex) : -1,
  };
};

export { describeScreen };
