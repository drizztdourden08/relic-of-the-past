/* @layer renderer-components @kind constants */
import { optionCatalog, DARK_ROOM_REQUIRED_KEY } from '@rotp/randomizer';
import type { OptionDef } from '@rotp/randomizer';

const DARK_ROOMS_TITLE = 'Dark rooms';

const LIGHTS_LABEL = 'Lights';

const BLIND_NOTE = 'No light ticked, so the seed may send you through a dark room blind.';

const DARK_ROOM_REQUIRED_OPTION: OptionDef | undefined =
  optionCatalog.find((option) => option.key === DARK_ROOM_REQUIRED_KEY);

export { BLIND_NOTE, DARK_ROOMS_TITLE, DARK_ROOM_REQUIRED_OPTION, LIGHTS_LABEL };
