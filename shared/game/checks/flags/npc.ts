/* @layer shared-game @kind data */
/**
 * NPC Check Configuration — single source of truth for NPC-type checks.
 *
 * Each entry defines:
 *   1. DETECTION: how to poll whether the check is complete (progress buffer byte + mask)
 *   2. TRIGGER:   how to programmatically fire the check (sprite type, post-gfx, item, extras)
 *
 * WasmGetProgressFlags() returns a 16-byte buffer:
 *   [0]  = sram_progress_indicator   (0xF3C5)
 *   [1]  = sram_progress_flags       (0xF3C6)
 *   [2]  = sram_progress_indicator_3 (0xF3C9)
 *   [3]  = link_item_flippers
 *   [4]  = link_item_boots
 *   [5]  = link_item_bug_net
 *   [6]  = link_item_mirror
 *   [7]  = link_item_quake_medallion
 *   [8]  = link_magic_consumption
 *   [9]  = save_dung_info[0x109] lo (Potion Shop room flag)
 *   [10] = save_dung_info[0x123] lo (Mini Moldorm Cave room flag)
 *   [11] = save_dung_info[0x11E] lo (Hype Cave room flag)
 *   [12] = player_sleep_in_bed_state (0=asleep, 1=uncle woke, 2=out of bed)
 *   [13] = follower_indicator (tagalong id; 0=none) — used by NPC presence gating
 *
 * Source: core/zelda3/src/sprite_main.c (NPC handlers)
 */
import type { PresenceCondition } from '../presence-condition';

interface NpcCheckConfig {
  // ─── Detection (bridge polling) ───
  /** Index into the progress buffer */
  bufferIndex: number;
  /** Bit mask to check for completion (use 0xFF for "any nonzero") */
  mask: number;

  // ─── Trigger (WasmTriggerNpcCheck params) ───
  /** Flag type for setting: 0=sram_progress_flags, 1=sram_progress_indicator, 2=sram_progress_indicator_3 */
  flagType: number;
  /** Bit mask to OR into the flag byte when triggering */
  flagMask: number;
  /** Item ID to give via Link_ReceiveItem */
  itemId: number;
  /** Sprite type to find and transition (0xFF = no sprite change) */
  spriteType: number;
  /** sprite_graphics value to set after trigger (post-check visual) */
  postGfx: number;
  /**
   * Native room index where this NPC actually gives its check. When set, the
   * simulator's sprite→check matcher only binds a discovered sprite to this
   * config if the sprite's live room equals `room` — needed when the same
   * sprite type appears in more than one room (the Uncle 0x73 spawns both in
   * Link's house intro room 0x104 and the sword-giving secret passage 0x55).
   * Omit for NPCs whose sprite type is unambiguous; those match by type alone.
   */
  room?: number;
  /**
   * Which world this NPC lives in, for OVERWORLD sprites only.
   *
   * A sprite type is not unique across the two worlds: 0x2e is both the
   * light-world flute boy and the dark-world stump (chosen by `sprite_subtype2`
   * in `Sprite_2E_FluteKid`), and 0x1a is both the smith and the frog. The
   * simulator reads the addressable spawn table, which does not carry
   * `subtype2`, so matching on type alone bound the light-world boy to the
   * stump's config and wrote its item flag on a screen the player can reach
   * before the dark world exists at all.
   *
   * Overworld screen indices at or above 0x40 are the second world — a property
   * of the game, not of our data — so the screen the sprite sits on settles it.
   */
  owWorld?: 'light' | 'dark';

  // ─── Documentation ───
  /** What visually happens to the NPC after the check */
  visualNote: string;
  /** Source function in sprite_main.c */
  sourceFunc: string;

  // ─── Presence (simulator) ───
  /**
   * Declarative spawn condition the simulator evaluates against live game state
   * to decide whether this NPC is actually present at the current progress. This
   * is the sanctioned single exception to the sim's "detection is data-free" rule
   * (see presence-condition.ts). Omit it for unconditional NPCs — absent means
   * "always present when the room is reachable".
   */
  presence?: PresenceCondition;
}

/**
 * Backwards-compatible type alias for the bridge polling code.
 */
interface NpcFlagEntry {
  bufferIndex: number;
  mask: number;
}

const CHECK_NPC_FLAGS: Record<string, NpcCheckConfig> = {
  // ═══════════════════════════════════════════════════════════════
  // Link's Uncle — Secret Passage (room 0x55)
  // Sprite 0x73 (UncleAndPriest), handler: Uncle_InPassage
  // Sets sram_progress_flags |= 1, sram_progress_indicator = 1
  // Visual: Sword/shield disappear from Uncle's hands (gfx 0→1)
  // ═══════════════════════════════════════════════════════════════
  "Link's Uncle": {
    bufferIndex: 1, mask: 0x01,
    flagType: 0, flagMask: 0x01,
    itemId: 0x00,
    spriteType: 0x73, postGfx: 1,
    room: 0x55,
    visualNote: 'Sword/shield disappear from hands (lying down pose)',
    sourceFunc: 'Uncle_InPassage',
    // Sprite 0x73 spawns in two rooms: Link's house intro room (0x104, the
    // scripted uncle — NOT a check) and the secret passage (0x55, the sword
    // check). `room: 0x55` binds this config to the passage only, so the house
    // uncle is never matched. No presence gate: the passage uncle is available
    // until collected, and the engine's done-set stops re-discovery in a run.
  },

  // ═══════════════════════════════════════════════════════════════
  // King Zora — Room 0x181 (Zora's Domain)
  // Sprite 0x52, handler: Sprite_52_KingZora
  // Detection: link_item_flippers != 0 (bufferIndex 3)
  // Spawns bouncing item 0xC0 with sprite_A=0x1E, sprite_graphics=12
  // ═══════════════════════════════════════════════════════════════
  'King Zora': {
    bufferIndex: 3, mask: 0xFF,
    flagType: 2, flagMask: 0x00,
    itemId: 0x1E,
    spriteType: 0x52, postGfx: 12,
    visualNote: 'Zora submerges after giving item (gfx 12)',
    sourceFunc: 'Sprite_52_KingZora',
    // Only offers the Flippers while Link doesn't already own them.
    presence: { item: 'Flippers', owned: false },
  },

  // ═══════════════════════════════════════════════════════════════
  // Sahasrahla — Room 0x1EA (Sahasrahla's Hut)
  // Sprite 0x16, handler: Sprite_Sahasrahla
  // Detection: link_item_boots != 0 (bufferIndex 4)
  // Sets savegame_map_icons_indicator = 3, gives item 0x4B
  // ═══════════════════════════════════════════════════════════════
  'Sahasrahla': {
    bufferIndex: 4, mask: 0xFF,
    flagType: 2, flagMask: 0x00,
    itemId: 0x4B,
    spriteType: 0x16, postGfx: 0,
    visualNote: 'Stays in place (frame-based idle animation)',
    sourceFunc: 'Sprite_Sahasrahla',
    // Sasha_Idle (sprite_main.c:6560) only reaches the boots branch when the
    // first dungeon's pendant is held and the boots are not:
    //   if (!(link_which_pendants & 4))      -> talks only
    //   else if (!link_item_boots)           -> ai_state = 2, grants 0x4b
    // `link_which_pendants & 4` is the tracker's 'Green Pendant'
    // (tracker/inventory.ts). Without this the boots were free from the start,
    // and everything they open -- bonk rocks, the ledge behind one, and the
    // interior behind THAT -- came with them.
    presence: { and: [{ item: 'Green Pendant', owned: true }, { item: 'Pegasus Boots', owned: false }] },
  },

  // ═══════════════════════════════════════════════════════════════
  // Sick Kid — Room 0x109 (Sick Kid's House)
  // Sprite 0x1F, handler: Sprite_1F_SickKid
  // Detection: link_item_bug_net != 0 (bufferIndex 5)
  // State 2 gives item 0x21 (Bug Net), moves to state 3
  // ═══════════════════════════════════════════════════════════════
  'Sick Kid': {
    bufferIndex: 5, mask: 0xFF,
    flagType: 2, flagMask: 0x00,
    itemId: 0x21,
    spriteType: 0x1F, postGfx: 1,
    visualNote: 'Changes to lying-still graphics (gfx 1)',
    sourceFunc: 'Sprite_1F_SickKid',
  },

  // ═══════════════════════════════════════════════════════════════
  // Old Man — Room 0xE4 subtype2=1 (Death Mountain Cave)
  // Sprite 0xAD, handler: Sprite_AD_OldMan
  // Detection: link_item_mirror == 2 (bufferIndex 6, mask 0xFF)
  // Gives item 0x1A (Magic Mirror), sets which_starting_point = 1
  // ═══════════════════════════════════════════════════════════════
  'Old Man': {
    bufferIndex: 6, mask: 0xFF,
    flagType: 2, flagMask: 0x00,
    itemId: 0x1A,
    spriteType: 0xAD, postGfx: 0,
    visualNote: 'Stays seated (frame-based animation)',
    sourceFunc: 'Sprite_AD_OldMan',
    // Present only when Link has no follower in tow AND doesn't yet hold the
    // Magic Mirror (link_item_mirror level 2 = tracker's "Magic Mirror").
    presence: { and: [{ follower: 'none' }, { item: 'Magic Mirror', owned: false }] },
  },

  // ═══════════════════════════════════════════════════════════════
  // Catfish — Overworld 0x?? (Dark World Lake Hylia area)
  // Sprite 0xC0 with sprite_A[k]=0, handler: Catfish_BigFish
  // Detection: link_item_quake_medallion != 0 (bufferIndex 7)
  // Spawns bouncing item 0xC0 with sprite_A=0x11 (Quake)
  // ═══════════════════════════════════════════════════════════════
  'Catfish': {
    bufferIndex: 7, mask: 0xFF,
    flagType: 2, flagMask: 0x00,
    itemId: 0x11,
    spriteType: 0xFF, postGfx: 0,
    visualNote: 'Catfish submerges; spawns bouncing medallion',
    sourceFunc: 'Catfish_BigFish',
  },

  // ═══════════════════════════════════════════════════════════════
  // Bottle Merchant — Overworld Kakariko
  // Sprite 0x75, handler: Sprite_BottleVendor
  // Detection: sram_progress_indicator_3 & 0x02 (bufferIndex 2)
  // Gives item 0x16 (Bottle), costs 100 rupees
  // ═══════════════════════════════════════════════════════════════
  'Bottle Merchant': {
    bufferIndex: 2, mask: 0x02,
    flagType: 2, flagMask: 0x02,
    itemId: 0x16,
    spriteType: 0x75, postGfx: 0,
    visualNote: 'Stays in place (random facing animation)',
    sourceFunc: 'Sprite_BottleVendor',
  },

  // ═══════════════════════════════════════════════════════════════
  // Magic Bat — Room 0x115 (Bat Cave)
  // Sprite 0x3A, handler: Sprite_3A_MagicBat
  // Detection: link_magic_consumption >= 1 (bufferIndex 8, mask 0xFF)
  // Sets link_magic_consumption = 1 (half magic), no Link_ReceiveItem
  // ═══════════════════════════════════════════════════════════════
  'Magic Bat': {
    bufferIndex: 8, mask: 0xFF,
    flagType: 2, flagMask: 0x00,
    itemId: 0xFF,
    spriteType: 0x3A, postGfx: 0,
    visualNote: 'Bat flies around then disappears',
    sourceFunc: 'Sprite_3A_MagicBat',
  },

  // ═══════════════════════════════════════════════════════════════
  // Hobo — Overworld (Under Bridge)
  // Sprite 0x2B subtype2=0, handler: Sprite_Hobo_Bum
  // Detection: sram_progress_indicator_3 & 0x01 (bufferIndex 2)
  // Sets sram_progress_indicator_3 |= 1, save_ow_event_info |= 0x20
  // Gives item 0x16 (Bottle)
  // ═══════════════════════════════════════════════════════════════
  'Hobo': {
    bufferIndex: 2, mask: 0x01,
    flagType: 2, flagMask: 0x01,
    itemId: 0x16,
    spriteType: 0x2B, postGfx: 1,
    visualNote: 'Transitions to sleeping pose (gfx 1)',
    sourceFunc: 'Sprite_Hobo_Bum',
  },

  // ═══════════════════════════════════════════════════════════════
  // Blacksmith — Room 0x121 (Blacksmith's Hut)
  // Sprite 0x1A subtype2=0, handler: Smithy_Main state 6
  // Detection: sram_progress_indicator_3 & 0x04 (custom bit, bufferIndex 2)
  // Vanilla uses 0x80 for tempering-in-progress; we use unused bit 2 (0x04)
  // Gives item 0x02 (Tempered Sword)
  // ═══════════════════════════════════════════════════════════════
  'Blacksmith': {
    bufferIndex: 2, mask: 0x04,
    flagType: 2, flagMask: 0x04,
    itemId: 0x02,
    spriteType: 0x1A, postGfx: 4,
    visualNote: 'Smiths hammering animation (gfx 4)',
    sourceFunc: 'Smithy_Main',
    // Blacksmith is the first CHECK_NPC_FLAGS entry for sprite 0x1A, so
    // npcConfigForSprite(0x1A) resolves here.
    //
    // Smithy_Main case 0 (sprite_main.c:10107) offers tempering only when the
    // smith-reunion flag is SET, and never while his partner is in tow:
    //   if (follower_indicator != 8) {
    //     ...
    //     else if (sram_progress_indicator_3 & 0x20) { -> tempering choice }
    //     else Sprite_ShowSolicitedMessage(k, 0xdf);   // just talks
    //   }
    // This read 'clear', i.e. the exact inverse -- so the tempered sword was
    // available before the smith had been found at all. The 10-rupee cost is
    // not modelled: money is assumed farmable.
    presence: { and: [{ progressIndicator3: 0x20, state: 'set' }, { not: { followerEq: 8 } }] },
  },

  // ═══════════════════════════════════════════════════════════════
  // Stumpy — Overworld (Dark World grove)
  // Sprite 0x2E subtype2=1, handler: Sprite_FluteKid_Stumpy
  // Detection: sram_progress_indicator_3 & 0x08 (bufferIndex 2)
  // Gives item 0x13 (Shovel)
  // ═══════════════════════════════════════════════════════════════
  'Stumpy': {
    owWorld: 'dark',
    bufferIndex: 2, mask: 0x08,
    flagType: 2, flagMask: 0x08,
    itemId: 0x13,
    spriteType: 0x2E, postGfx: 3,
    visualNote: 'Changes to tree stump form (gfx 3)',
    sourceFunc: 'Sprite_FluteKid_Stumpy',
  },

  // ═══════════════════════════════════════════════════════════════
  // Frog — Overworld (Dark World smithy area)
  // Sprite 0x1A subtype2=2, handler: Smithy_Frog
  // Detection: sram_progress_indicator_3 & 0x20 (bufferIndex 2)
  // Becomes tagalong (follower_indicator = 7), no direct item
  // Flag is set when delivered to smithy (Smithy_Homecoming)
  // ═══════════════════════════════════════════════════════════════
  'Frog': {
    bufferIndex: 2, mask: 0x20,
    flagType: 2, flagMask: 0x20,
    itemId: 0xFF,
    spriteType: 0x1A, postGfx: 0,
    visualNote: 'Sprite disappears (becomes tagalong)',
    sourceFunc: 'Smithy_Frog',
  },

  // ═══════════════════════════════════════════════════════════════
  // Missing Smith — Room 0x121 (Blacksmith's Hut, after Frog delivered)
  // Sprite 0x1A subtype2=0, handler: Smithy_Homecoming
  // Detection: sram_progress_indicator_3 & 0x20 (same as Frog — smith reunited)
  // This is the "delivery" event — set when frog arrives at smithy
  // ═══════════════════════════════════════════════════════════════
  'Missing Smith': {
    bufferIndex: 2, mask: 0x20,
    flagType: 2, flagMask: 0x20,
    itemId: 0xFF,
    spriteType: 0xFF, postGfx: 0,
    visualNote: 'Smiths are reunited and start hammering',
    sourceFunc: 'Smithy_Homecoming',
  },

  // ═══════════════════════════════════════════════════════════════
  // Potion Shop — Room 0x109 (Witch's Hut)
  // Sprite 0x36 (Witch), handler: Sprite_Witch / Witch_AcceptShroom
  // Detection: save_dung_info[0x109] & 0x80 (bufferIndex 9)
  // Mushroom traded → powder spawns on counter (item 0x0D)
  // ═══════════════════════════════════════════════════════════════
  'Potion Shop': {
    bufferIndex: 9, mask: 0x80,
    flagType: 2, flagMask: 0x00,
    itemId: 0x0D,
    spriteType: 0x36, postGfx: 0,
    // Sprite_Witch case 0 (core/zelda3/src/sprite_main.c:5851) only reaches the
    // trade when the mushroom itself is in hand:
    //   if (link_item_mushroom == 0)       -> talks only
    //   else if (link_item_mushroom == 1)  -> Witch_AcceptShroom
    //   else                               -> already holds the powder
    // The two values share one inventory slot, which the tracker splits into
    // 'Mushroom' (1) and 'Magic Powder' (2), so naming the mushroom covers both
    // the not-yet and already-traded cases. Without this the powder was granted
    // on sight, with the mushroom never picked up.
    presence: { item: 'Mushroom', owned: true },
    visualNote: 'Witch stays; powder appears on counter',
    sourceFunc: 'Sprite_Witch',
  },

  // ═══════════════════════════════════════════════════════════════
  // Purple Chest — Overworld (DW) → Locksmith (room 0x??)
  // Sprite 0x39 (Locksmith), handler: Sprite_39_Locksmith
  // Detection: sram_progress_indicator_3 & 0x10 (bufferIndex 2)
  // Gives item 0x16 (Bottle)
  // ═══════════════════════════════════════════════════════════════
  'Purple Chest': {
    owWorld: 'dark',
    bufferIndex: 2, mask: 0x10,
    flagType: 2, flagMask: 0x10,
    itemId: 0x16,
    spriteType: 0x39, postGfx: 0,
    visualNote: 'Chest disappears (sprite killed)',
    sourceFunc: 'Sprite_39_Locksmith',
    // Absent while Link is escorting the purple-chest follower (follower_indicator
    // == 9); once opened, sram_progress_indicator_3 & 0x10 (0xF3C9) is set, so
    // present only while that bit is still clear.
    presence: { and: [{ not: { followerEq: 9 } }, { progressIndicator3: 0x10, state: 'clear' }] },
  },

  // ═══════════════════════════════════════════════════════════════
  // Mini Moldorm Cave - Generous Guy — Room 0x123
  // Sprite 0x28, handler: Sprite_28_DarkWorldHintNPC
  // Detection: save_dung_info[0x123] & 0x40 (bufferIndex 10)
  // Vanilla: restores health for 20 rupees. Rando: gives item.
  // ═══════════════════════════════════════════════════════════════
  'Mini Moldorm Cave - Generous Guy': {
    bufferIndex: 10, mask: 0x40,
    flagType: 2, flagMask: 0x00,
    itemId: 0xFF,
    spriteType: 0x28, postGfx: 0,
    visualNote: 'NPC stays in place (fortune teller idle)',
    sourceFunc: 'Sprite_28_DarkWorldHintNPC',
  },

  // ═══════════════════════════════════════════════════════════════
  // Hype Cave - Generous Guy — Room 0x11E
  // Sprite 0x28, handler: Sprite_28_DarkWorldHintNPC
  // Detection: save_dung_info[0x11E] & 0x40 (bufferIndex 11)
  // Vanilla: restores health for 20 rupees. Rando: gives item.
  // ═══════════════════════════════════════════════════════════════
  'Hype Cave - Generous Guy': {
    bufferIndex: 11, mask: 0x40,
    flagType: 2, flagMask: 0x00,
    itemId: 0xFF,
    spriteType: 0x28, postGfx: 0,
    visualNote: 'NPC stays in place (fortune teller idle)',
    sourceFunc: 'Sprite_28_DarkWorldHintNPC',
  },
};

export { CHECK_NPC_FLAGS };
export type { NpcCheckConfig, NpcFlagEntry };
