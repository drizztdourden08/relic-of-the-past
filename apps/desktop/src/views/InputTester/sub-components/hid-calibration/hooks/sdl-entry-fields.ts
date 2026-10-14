/* @layer renderer-components @kind logic */
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import { NO_SDL_ENTRY } from './sdl-entry-fields.constants';
import type { SdlEntryFields } from './sdl-entry-fields.type';

const sdlEntryFields = (entry: DeviceEntry | null | undefined): SdlEntryFields => {
  if (!entry) return NO_SDL_ENTRY;
  return {
    guid: entry.guid ?? null,
    sdlMapping: entry.mapping ?? null,
    sdlType: entry.sdlType ?? null,
    sdlHasButton: entry.hasButton ?? null,
    sdlHasAxis: entry.hasAxis ?? null,
  };
};

export { sdlEntryFields };
