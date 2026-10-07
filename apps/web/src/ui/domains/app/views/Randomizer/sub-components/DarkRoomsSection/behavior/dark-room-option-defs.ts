/* @layer renderer-components @kind logic */
/**
 * The catalog entry this section stands in for: the requirement keeps its
 * plain row, so the setting reads exactly as it did in the list. The lights
 * hand over nothing but their art. A tile is an ITEM, and a row of four
 * sentences saying "carrying it lights a room" four times over told a reader
 * nothing the picture and the tick had not already said.
 *
 * Read off the shipped catalog once, at module load, the same way the catalog
 * partition is: the catalog is static module data.
 */
import { apOptionCatalog } from '@shared/randomizer/ap-world/options.data';
import { DARK_ROOM_REQUIRED_KEY } from '@shared/randomizer/ap-world/dark-rooms/dark-room-option-keys';
import type { ApOptionDef } from '@shared/randomizer/ap-world/options.type';

const DARK_ROOM_REQUIRED_OPTION: ApOptionDef | undefined =
  apOptionCatalog.find((option) => option.key === DARK_ROOM_REQUIRED_KEY);

export { DARK_ROOM_REQUIRED_OPTION };
