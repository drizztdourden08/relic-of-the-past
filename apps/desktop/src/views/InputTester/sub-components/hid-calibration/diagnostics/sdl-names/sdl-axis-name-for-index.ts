/* @layer renderer-components @kind logic */
import { AXIS_NAME_BY_INDEX } from './sdl-names.constants';

const sdlAxisNameForIndex = (index: number): string | null => AXIS_NAME_BY_INDEX[index] ?? null;

export { sdlAxisNameForIndex };
