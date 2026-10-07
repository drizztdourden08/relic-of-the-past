/* @layer core-game-hooks @kind native */
// THE allocation of the hook-owned save bytes: one registry, no address written twice.
//
// WHY THE SPAN EXISTS. Several hooks need a fact to survive a save and a reload, and no
// saveload struct may grow (the state-layout probe is pinned). The battery block is the
// way through: SaveGameFile (messaging.c) copies and checksums the whole 0x500 bytes at
// g_ram 0xF000, and a save state snapshots all of WRAM, so a byte placed inside the block
// is carried by BOTH save paths with no struct change at all. The 0xF406-0xF4FD run is
// written by nothing else in the entire tree (verified: no g_ram access and no offset
// table entry reaches it), and reads as zero on a vanilla file, so a vanilla read of a
// file we wrote sees bytes it never looks at, and a vanilla file we read hands every hook
// its own "nothing recorded yet".
//
// WHY IT IS ONE FILE. The claims below were allocated independently, in separate features,
// and the prose in each owner drifted into re-describing its neighbours. Every address now
// has exactly one definition, here, and the compile-time checks at the bottom fail the
// build if two claims overlap or one leaves the span. An owner keeps its own accessor
// macro, built from these constants; no hook file spells a 0xF4xx literal any more.
//
// ADDING A CLAIM. Insert it in ASCENDING address order, give it a base and a count, name
// the owner and the meaning, and add the two matching asserts. The gaps (0xF406-0xF40F,
// 0xF41E-0xF41F, 0xF45D-0xF4FD) are free.
//
// THE TS MIRROR. apps/web/src/lib/game/save-file/hook-save-bytes.ts restates these
// addresses for the offline save-file reader; tests/randomizer/hook-save-bytes.test.ts
// parses THIS header and fails if the two ever disagree.
#ifndef GAME_HOOKS_SAVE_BYTES_H
#define GAME_HOOKS_SAVE_BYTES_H

// The battery block the game saves and checksums, and the run inside it that is ours.
#define SAVE_BLOCK_BASE 0xF000
#define HOOK_SAVE_FIRST 0xF406
#define HOOK_SAVE_LAST 0xF4FD

// ─── 0xF410-0xF412: npc_overrides.c, substitution-completion bits ───
// One bit per substitutable possession-gated giver, keyed by the vanilla receive id its
// script grants. Byte 0 bits 0-7, byte 1 bits 0-6, byte 2 bits 0-2; the rest reserved.
// Bytes 0 and 1 are progress-buffer entries [21] and [22], byte 2 is [25].
#define SRM_SUBSTITUTION_TAKEN 0xF410
#define SRM_SUBSTITUTION_TAKEN_COUNT 3

// ─── 0xF413: capacity_profile.c, wallet ladder index ───
// The rung of the hook-owned wallet ladder (capacity_tiers.h) this file has climbed to;
// the rupee ceiling follows it. Progress-buffer entry [26].
#define SRM_WALLET_LADDER_INDEX 0xF413

// ─── 0xF414-0xF416: capacity_profile.c, empty-rung flags ───
// One flag per counted family, in family order: explosives, projectiles, meter. The
// family's native byte keeps its vanilla meaning (0 = the first native level) and the
// flag says the family is still BELOW it, so a vanilla read never sees an out-of-grid
// index. Progress-buffer entries [27], [28] and [29].
#define SRM_EMPTY_RUNG 0xF414
#define SRM_EMPTY_RUNG_COUNT 3

// ─── 0xF417-0xF418: prize_grants.c, reward-handed-over bits ───
// One bit per palace index (0-12): this dungeon's falling reward was handed over. Read
// alongside the vanilla pendant/crystal expression by the two room tags, so a substituted
// reward stops respawning and the arena door opens without the inventory bit being faked.
#define SRM_PRIZE_TAKEN 0xF417
#define SRM_PRIZE_TAKEN_COUNT 2

// ─── 0xF419: prize_grants.c, crystal in flight ───
// The crystal bit the receipt currently in flight must bank, 0 for none. Banked up front
// so an interrupted cutscene cannot lose the item; the rising-crystal seam re-ORs it.
#define SRM_PENDING_CRYSTAL 0xF419

// ─── 0xF41A: pond_plan.c, throws taken ───
// How many throws of the planned pond sequence have been paid for. Never rewinds, so no
// prize is handed out twice and the pond cannot be farmed.
#define SRM_POND_THROWS 0xF41A

// ─── 0xF41B-0xF41C: wish_pond_plan.c, throws taken at each item-throwing water ───
// How many throws of the planned rung sequence each of the two ponds has been paid for, in the
// order wish_pond_plan.c counts them: the light world water first, the dark world one second.
// Two bytes and not one, because the ponds sell separate sequences and a shared counter would let
// a throw into one water spend the other's rung. Neither rewinds, so no rung pays out twice.
#define SRM_WISH_POND_THROWS 0xF41B
#define SRM_WISH_POND_THROWS_COUNT 2

// ─── 0xF41D: smith_sword.c, the sword the smiths keep ───
// The sword level handed over when the tempering is paid, as 0x80 | level, and 0 while the
// smiths hold nothing. The game writes 255 over the level at that moment and never keeps it,
// so this is the one place it survives until the pickup.
#define SRM_SWORD_AT_SMITHS 0xF41D

// ─── 0xF420-0xF43E: shop_table.c, sold counters ───
// One byte per canonical shelf slot: how many of that slot's armed steps have been
// bought. A plain byte, not a bit dance, so a counter read is one load.
#define SRM_SHOP_SOLD 0xF420
#define SRM_SHOP_SOLD_COUNT 31

// ─── 0xF43F-0xF456: events/event_ledger.c, the event ledger ───
// One bit per event the game never records for itself (events/event_ids.h names them; the
// bit index is a save-file fact and never moves). Written only while kFeatures5_EventLedger
// is set, by a test-and-set, so a save-state rewind that replays a trigger frame changes
// nothing. Zero on a vanilla file.
#define SRM_EVENT_LEDGER 0xF43F
#define SRM_EVENT_LEDGER_COUNT 24

// ─── 0xF457-0xF458: ap_received_index.c, online items received ───
// How many items of the multiworld server's received list this file has already taken, as a
// little-endian 16-bit count. The host owns the meaning and writes it; the core only keeps it,
// so it travels with the battery save and with a save state. Zero on a vanilla file.
#define SRM_AP_RECEIVED_INDEX 0xF457
#define SRM_AP_RECEIVED_INDEX_COUNT 2

// ─── 0xF459-0xF45C: ap_room_hash.c, online room identity ───
// A 32-bit FNV-1a hash of the multiworld room's seed name, little-endian. Written by the host
// on the file's first delivery from a room; a file holding another room's hash takes nothing.
// Zero on a vanilla file and on a file no room has delivered to yet.
#define SRM_AP_ROOM_HASH 0xF459
#define SRM_AP_ROOM_HASH_COUNT 4

// ─── Compile-time checks ───
// Claims are listed in ascending address order above, so "each base is at or past the end
// of the one before it" is exactly the no-overlap property; the first and last bounds keep
// the whole allocation inside the span.
_Static_assert(SRM_SUBSTITUTION_TAKEN >= HOOK_SAVE_FIRST,
               "hook save bytes must start at or after 0xF406");
_Static_assert(SRM_WALLET_LADDER_INDEX >= SRM_SUBSTITUTION_TAKEN + SRM_SUBSTITUTION_TAKEN_COUNT,
               "wallet ladder index overlaps the substitution-completion bits");
_Static_assert(SRM_EMPTY_RUNG >= SRM_WALLET_LADDER_INDEX + 1,
               "empty-rung flags overlap the wallet ladder index");
_Static_assert(SRM_PRIZE_TAKEN >= SRM_EMPTY_RUNG + SRM_EMPTY_RUNG_COUNT,
               "reward-handed-over bits overlap the empty-rung flags");
_Static_assert(SRM_PENDING_CRYSTAL >= SRM_PRIZE_TAKEN + SRM_PRIZE_TAKEN_COUNT,
               "crystal in flight overlaps the reward-handed-over bits");
_Static_assert(SRM_POND_THROWS >= SRM_PENDING_CRYSTAL + 1,
               "pond throw counter overlaps the crystal in flight");
_Static_assert(SRM_WISH_POND_THROWS >= SRM_POND_THROWS + 1,
               "wish pond throw counters overlap the rupee pond throw counter");
_Static_assert(SRM_SWORD_AT_SMITHS >= SRM_WISH_POND_THROWS + SRM_WISH_POND_THROWS_COUNT,
               "the smiths' sword overlaps the wish pond throw counters");
_Static_assert(SRM_SHOP_SOLD >= SRM_SWORD_AT_SMITHS + 1,
               "shelf sold counters overlap the smiths' sword");
_Static_assert(SRM_EVENT_LEDGER >= SRM_SHOP_SOLD + SRM_SHOP_SOLD_COUNT,
               "event ledger overlaps the shelf sold counters");
_Static_assert(SRM_AP_RECEIVED_INDEX >= SRM_EVENT_LEDGER + SRM_EVENT_LEDGER_COUNT,
               "online received index overlaps the event ledger");
_Static_assert(SRM_AP_ROOM_HASH >= SRM_AP_RECEIVED_INDEX + SRM_AP_RECEIVED_INDEX_COUNT,
               "online room hash overlaps the online received index");
_Static_assert(SRM_AP_ROOM_HASH + SRM_AP_ROOM_HASH_COUNT - 1 <= HOOK_SAVE_LAST,
               "hook save bytes must end at or before 0xF4FD");

#endif  // GAME_HOOKS_SAVE_BYTES_H
