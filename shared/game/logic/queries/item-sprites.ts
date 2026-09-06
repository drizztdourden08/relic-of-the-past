/* @layer shared-game @kind logic */
/**
 * Sprite URLs of the extracted set: the base the active ROM's files are served
 * from, plus the revision of the set behind it. The revision matters because a
 * set is rewritten IN PLACE: a background re-extraction clears the folder and
 * writes it again at the same names, so every URL already on screen keeps
 * pointing at a file that briefly does not exist and then does. Carrying the
 * revision in the URL makes a rewritten set a new source: the image is fetched
 * again instead of keeping the failure it latched during the rewrite.
 */
import { getItem } from '../../data';
import { rupeeGemSpriteFileOf } from '../../data/sprite-manifest/rupee-gem-files';
import type { CapacityFamilyId, InventorySlot, ItemId, ItemRecord } from '../../data';

let spritesBase = '/sprites/items/';
let spritesRevision = 0;

const setSpritesBase = (base: string): void => {
  spritesBase = base;
};

/** How many times the set behind the base has been rewritten this session; 0 = as found. */
const setSpritesRevision = (revision: number): void => {
  spritesRevision = revision;
};

const getSpritesBase = (): string => spritesBase;

/** `<base><file>.png`, carrying the revision so a rewritten set is a new source. */
const spriteUrlOf = (filename: string): string =>
  `${spritesBase}${filename}.png${spritesRevision > 0 ? `?v=${spritesRevision}` : ''}`;

/** Strips the `sprite-` id prefix down to the extracted PNG's filename. */
const spriteFilename = (spriteId: string | undefined): string | undefined =>
  spriteId ? spriteId.slice('sprite-'.length) : undefined;

/**
 * The extracted PNG an item record shows: a rupee reward's coloured gem
 * (rupee-gem-files.ts) ahead of the record's own sprite, which for the large
 * values names the game's numbered art.
 */
const itemSpriteFile = (item: ItemRecord): string | undefined =>
  rupeeGemSpriteFileOf(item.gameId?.receiveItemId) ?? spriteFilename(item.spriteId);

const getItemSprite = (itemId: ItemId): string | undefined => {
  const filename = itemSpriteFile(getItem(itemId));
  if (!filename) return undefined;
  return spriteUrlOf(filename);
};

/** The stamped capacity-upgrade sprite of a family: `upgrade-<family>.png`. */
const getCapacityUpgradeSprite = (family: CapacityFamilyId): string =>
  spriteUrlOf(`upgrade-${family}`);

const resolveItemSprite = (slot: InventorySlot, inventory: ReadonlySet<ItemId>): { obtained: boolean; sprite: string } => {
  for (const itemId of slot.trackerItemIds) {
    if (inventory.has(itemId)) {
      const filename = itemSpriteFile(getItem(itemId));
      return { obtained: true, sprite: filename ?? slot.sprite };
    }
  }
  return { obtained: false, sprite: slot.sprite };
};

export {
  getCapacityUpgradeSprite,
  getItemSprite,
  getSpritesBase,
  resolveItemSprite,
  setSpritesBase,
  setSpritesRevision,
  spriteFilename,
  spriteUrlOf,
};
