/* @layer renderer-components @kind logic */
import { BUTTON_NAME_BY_INDEX } from './sdl-names.constants';

const sdlButtonNameForIndex = (index: number): string | null => BUTTON_NAME_BY_INDEX[index] ?? null;

export { sdlButtonNameForIndex };
