/* @layer shared-game @kind types */
import type { CheckId, DungeonId, ItemId, SpriteId } from '../ids';
import type { ItemCategory } from '../../taxonomy/item-categories';
import type { WeaponProfile } from '../combat';
import type { ItemOrigin } from '../../enumeration/enumeration.generated.type';
import type { ReviewMark } from '../review';

interface ItemGameId {
  receiveItemId?: number;
}

interface ItemRecord {
  id: ItemId;
  gameId?: ItemGameId;
  origin: ItemOrigin;
  category: ItemCategory;
  name: string;
  dungeonId?: DungeonId;
  tier?: number;
  poolClass?: 'progression' | 'useful' | 'filler';
  spendsMeter?: true;
  weapon?: WeaponProfile;
  aliasOf?: ItemId;
  sharesSlotWith?: readonly ItemId[];
  usualChestId?: CheckId;
  spriteId?: SpriteId;
  review?: ReviewMark;
}

export type { ItemGameId, ItemOrigin, ItemRecord };
