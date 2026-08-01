/* @layer shared-game @kind logic */
/**
 * Maps a discovered interactable (chest / NPC sprite / standing or overworld
 * item) to the `TriggerAction` that fires the real check through the delivery
 * queue. NPC sprites resolve their flag/item payload from the check records'
 * own gameId by sprite type; everything else is derived from the
 * interactable itself.
 */
import type { SimChest, SimSprite, TriggerAction } from '../types';
import type { CheckRecord } from '../../data';
import { find, getCheckByGameId } from '../../data';

const planChestTrigger = (chest: SimChest): TriggerAction => ({
  type: 'chest',
  roomId: chest.roomId,
  chestIndex: chest.chestIndex,
  itemId: chest.itemId ?? 0,
});

/**
 * NPC config matching a discovered sprite. Configs are matched by sprite type;
 * a config that pins a `room` matches only when the sprite's live room equals it
 * (disambiguates a type that spawns in several rooms — see CheckGameId.room).
 * Room-less configs keep matching by type alone.
 */
/** Overworld screens from here up are the second world. */
const DARK_WORLD_SCREEN_BASE = 0x40;
/** A room is 64 columns of 8px, so X passes 0x100 at column 32. */
const HALF_ROOM_COLS = 32;
/** Room-state slots for the two bits a standing heart piece can occupy. */
const ROOM_BIT_HEART_RIGHT = 5;
const ROOM_BIT_HEART_LEFT = 6;
/** save_ow_event_info bit an outdoor pickup sets. */
const OW_PICKUP_MASK = 0x40;

const npcConfigForSprite = (spriteType: number, roomId?: number, outdoor?: boolean): CheckRecord | undefined =>
  find('check', c => c.gameId.spriteType !== undefined).find((c) => {
    const cfg = c.gameId;
    if (cfg.spriteType !== spriteType) return false;
    if (cfg.room !== undefined && cfg.room !== roomId) return false;
    // For an overworld sprite the "room" IS the screen index, so it says which
    // world the sprite is in — the only thing separating two NPCs that share a
    // sprite type across the worlds (see CheckGameId.owWorld).
    if (cfg.owWorld !== undefined && outdoor) {
      if (roomId == null) return false;
      const isDark = roomId >= DARK_WORLD_SCREEN_BASE;
      if (isDark !== (cfg.owWorld === 'dark')) return false;
    }
    return true;
  });

const planSpriteTrigger = (sprite: SimSprite): TriggerAction | null => {
  if (sprite.kind === 'npc') {
    const check = npcConfigForSprite(sprite.spriteType, sprite.roomId, sprite.outdoor);
    const cfg = check?.gameId;
    if (!cfg || cfg.itemId === undefined || cfg.flagType === undefined || cfg.flagMask === undefined) return null;
    // A room-flag NPC records its completion where the chest bits live, which the
    // npc action cannot reach — the chest action writes exactly that bit.
    if (cfg.roomFlag) {
      return { type: 'chest', roomId: cfg.roomFlag.roomId, chestIndex: cfg.roomFlag.chestIndex, itemId: cfg.itemId };
    }
    return { type: 'npc', flagType: cfg.flagType, flagMask: cfg.flagMask, itemId: cfg.itemId };
  }
  if (sprite.kind === 'standing' || sprite.kind === 'overworld') {
    // Outdoors the pickup is an overworld event bit, and the sprite's "room" IS
    // the screen it stands on.
    // Item id 0 is the uncle's sword, not "nothing", so a sprite with no mapped
    // item must not be triggered at all. Skipping leaves the check visibly
    // uncollected instead of quietly granting the wrong item.
    if (sprite.itemId === undefined) return null;
    if (sprite.outdoor) {
      return { type: 'overworld', screen: sprite.roomId, mask: OW_PICKUP_MASK, itemId: sprite.itemId };
    }
    // Indoors there is no screen to flag. The game records the pickup in the
    // ROOM's own state bits instead (HeartUpgrade_CheckIfAlreadyObtained,
    // sprite_main.c:1311): live 0x2000 when `sprite_x_hi & 1` — that is, X past
    // 0x100, so a column in the room's right half — and live 0x4000 otherwise.
    // Both are room-state slots, which the chest action already writes.
    const rightHalf = sprite.tile.col >= HALF_ROOM_COLS;
    const chestIndex = rightHalf ? ROOM_BIT_HEART_RIGHT : ROOM_BIT_HEART_LEFT;
    return { type: 'chest', roomId: sprite.roomId, chestIndex, itemId: sprite.itemId };
  }
  return null;
};

/**
 * The check a standing / overworld pickup IS.
 *
 * Derived from the SAME facts `planSpriteTrigger` writes when the run takes it —
 * an overworld event bit outdoors, a room-state slot indoors — so the two cannot
 * disagree about which check a given item on the floor represents. Without this
 * the overlay had no identity for a standing item and could only ever draw it as
 * available, however many times the run had already collected it.
 */
const checkForStandingItem = (sprite: SimSprite): CheckRecord | undefined => {
  if (sprite.kind !== 'standing' && sprite.kind !== 'overworld') return undefined;
  if (sprite.outdoor) return getCheckByGameId({ owScreen: sprite.roomId, mask: OW_PICKUP_MASK });
  const rightHalf = sprite.tile.col >= HALF_ROOM_COLS;
  return getCheckByGameId({ roomId: sprite.roomId, chestIndex: rightHalf ? ROOM_BIT_HEART_RIGHT : ROOM_BIT_HEART_LEFT });
};

/** Dispatch by interactable shape. */
const planTrigger = (interactable: SimChest | SimSprite): TriggerAction | null => {
  if ('chestIndex' in interactable) return planChestTrigger(interactable);
  return planSpriteTrigger(interactable);
};

export { planTrigger, planChestTrigger, planSpriteTrigger, npcConfigForSprite, checkForStandingItem };
