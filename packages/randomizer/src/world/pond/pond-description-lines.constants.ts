/* @layer shared-game @kind data */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { OptionDescriptionSource } from '../option-description.type';

const POND_JUMPS_DESCRIPTION: Message = { key: 'randomizer-world:desc.jumps' };

const POND_ITEMS_DESCRIPTION: Message = { key: 'randomizer-world:desc.pondItems' };

const POND_CUSTOM_LINE: { term: Message; detail: Message } = {
  term: { key: 'randomizer:pondMode.custom' },
  detail: { key: 'randomizer-world:detail.pond.custom' },
};

const CAPACITY_POND_MODE_DESCRIPTION: OptionDescriptionSource = [
  { term: { key: 'randomizer:pondMode.vanillaCost' }, detail: { key: 'randomizer-world:detail.pond.capacityVanillaCost' } },
  POND_CUSTOM_LINE,
];

const WISH_POND_MODE_DESCRIPTION: OptionDescriptionSource = [
  { term: { key: 'randomizer:pondMode.vanillaCost' }, detail: { key: 'randomizer-world:detail.pond.wishVanillaCost' } },
  POND_CUSTOM_LINE,
];

const POND_SHARE_DESCRIPTION: Message = { key: 'randomizer-world:desc.pondShare' };

export {
  CAPACITY_POND_MODE_DESCRIPTION, POND_ITEMS_DESCRIPTION, POND_JUMPS_DESCRIPTION, POND_SHARE_DESCRIPTION,
  WISH_POND_MODE_DESCRIPTION,
};
