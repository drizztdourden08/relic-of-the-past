/* @layer shared-game @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { OptionDescriptionSource } from '../option-description.type';

const POND_JUMPS_DESCRIPTION = msg('randomizer-world:desc.jumps');

const POND_ITEMS_DESCRIPTION = msg('randomizer-world:desc.pondItems');

const POND_CUSTOM_LINE = { term: msg('randomizer:pondMode.custom'), detail: msg('randomizer-world:detail.pond.custom') };

const CAPACITY_POND_MODE_DESCRIPTION: OptionDescriptionSource = [
  { term: msg('randomizer:pondMode.vanillaCost'), detail: msg('randomizer-world:detail.pond.capacityVanillaCost') },
  POND_CUSTOM_LINE,
];

const WISH_POND_MODE_DESCRIPTION: OptionDescriptionSource = [
  { term: msg('randomizer:pondMode.vanillaCost'), detail: msg('randomizer-world:detail.pond.wishVanillaCost') },
  POND_CUSTOM_LINE,
];

const POND_SHARE_DESCRIPTION = msg('randomizer-world:desc.pondShare');

export {
  CAPACITY_POND_MODE_DESCRIPTION, POND_ITEMS_DESCRIPTION, POND_JUMPS_DESCRIPTION, POND_SHARE_DESCRIPTION,
  WISH_POND_MODE_DESCRIPTION,
};
