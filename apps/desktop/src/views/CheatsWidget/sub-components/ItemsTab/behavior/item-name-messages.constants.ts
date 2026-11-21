/* @layer renderer-widgets @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';

const ITEM_NAME_BY_ID: Readonly<Record<number, Message>> = {
  73: msg('views-cheats:item.sword-fighter'), 1: msg('views-cheats:item.sword-master'),
  2: msg('views-cheats:item.sword-tempered'), 3: msg('views-cheats:item.sword-golden'),
  6: msg('views-cheats:item.shield-mirror'), 34: msg('views-cheats:item.mail-blue'), 35: msg('views-cheats:item.mail-red'),
  27: msg('views-cheats:item.power-glove'), 28: msg('views-cheats:item.titans-mitt'),
  12: msg('views-cheats:item.boomerang-blue'), 42: msg('views-cheats:item.boomerang-red'),
  41: msg('views-cheats:item.mushroom'), 13: msg('views-cheats:item.magic-powder'),
  19: msg('views-cheats:item.shovel'), 20: msg('views-cheats:item.flute'), 74: msg('views-cheats:item.flute-active'),
  10: msg('views-cheats:item.hookshot'), 40: msg('views-cheats:item.bombs'),
  7: msg('views-cheats:item.fire-rod'), 8: msg('views-cheats:item.ice-rod'),
  15: msg('views-cheats:item.bombos'), 16: msg('views-cheats:item.ether'), 17: msg('views-cheats:item.quake'),
  18: msg('views-cheats:item.lamp'), 9: msg('views-cheats:item.hammer'), 33: msg('views-cheats:item.bug-net'),
  29: msg('views-cheats:item.book'), 21: msg('views-cheats:item.somaria'), 24: msg('views-cheats:item.byrna'),
  25: msg('views-cheats:item.cape'), 26: msg('views-cheats:item.mirror'),
  75: msg('views-cheats:item.boots'), 30: msg('views-cheats:item.flippers'), 31: msg('views-cheats:item.moon-pearl'),
  11: msg('views-cheats:item.bow'), 59: msg('views-cheats:item.silver-bow'),
};

export { ITEM_NAME_BY_ID };
