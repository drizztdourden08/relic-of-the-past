/* @layer renderer-app @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';

interface GroupingText {
  label: Message;
  description: Message;
}

const GROUPING_TEXT: Readonly<Record<string, GroupingText>> = {
  world: {
    label: msg('views-randomizer:tracker.grouping.world.label'),
    description: msg('views-randomizer:tracker.grouping.world.description'),
  },
  area: {
    label: msg('views-randomizer:tracker.grouping.area.label'),
    description: msg('views-randomizer:tracker.grouping.area.description'),
  },
  location: {
    label: msg('views-randomizer:tracker.grouping.location.label'),
    description: msg('views-randomizer:tracker.grouping.location.description'),
  },
  dungeon: {
    label: msg('views-randomizer:tracker.grouping.dungeon.label'),
    description: msg('views-randomizer:tracker.grouping.dungeon.description'),
  },
  screen: {
    label: msg('views-randomizer:tracker.grouping.screen.label'),
    description: msg('views-randomizer:tracker.grouping.screen.description'),
  },
  type: {
    label: msg('views-randomizer:tracker.grouping.type.label'),
    description: msg('views-randomizer:tracker.grouping.type.description'),
  },
  content: {
    label: msg('views-randomizer:tracker.grouping.content.label'),
    description: msg('views-randomizer:tracker.grouping.content.description'),
  },
};

const FACET_CATEGORY_TEXT: Readonly<Record<string, Message>> = {
  world: msg('views-randomizer:tracker.facet-category.world'),
  location: msg('views-randomizer:tracker.facet-category.location'),
  area: msg('views-randomizer:tracker.facet-category.area'),
  content: msg('views-randomizer:tracker.facet-category.content'),
};

const FACET_TEXT: Readonly<Record<string, Message>> = {
  'world:light': msg('views-randomizer:tracker.facet.world-light'),
  'world:dark': msg('views-randomizer:tracker.facet.world-dark'),
  'location:dungeon': msg('views-randomizer:tracker.facet.location-dungeon'),
  'location:cave': msg('views-randomizer:tracker.facet.location-cave'),
  'location:house': msg('views-randomizer:tracker.facet.location-house'),
  'location:overworld': msg('views-randomizer:tracker.facet.location-overworld'),
};

export { FACET_CATEGORY_TEXT, FACET_TEXT, GROUPING_TEXT };
export type { GroupingText };
