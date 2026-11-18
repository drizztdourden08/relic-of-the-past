/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { optionCatalog, DARK_ROOM_REQUIRED_KEY } from '@rotp/randomizer';
import type { OptionDef } from '@rotp/randomizer';

const DARK_ROOMS_TITLE = msg('views-randomizer:darkRooms.title');

const LIGHTS_LABEL = msg('views-randomizer:darkRooms.lights');

const BLIND_NOTE = msg('views-randomizer:darkRooms.blind');

const DARK_ROOM_REQUIRED_OPTION: OptionDef | undefined =
  optionCatalog.find((option) => option.key === DARK_ROOM_REQUIRED_KEY);

export { BLIND_NOTE, DARK_ROOMS_TITLE, DARK_ROOM_REQUIRED_OPTION, LIGHTS_LABEL };
