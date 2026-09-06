/* @layer core-game-hooks @kind native */
// The progress-flags buffer: the save-flag and inventory bytes the checks tracker polls and
// the simulator reads while walking a route (FlagQueryGate — see game_hooks_internal.h).
#include "game_hooks_internal.h"

// ─── Progress Flags Query ───
// Layout: 31 bytes.
//   [0]  sram_progress_indicator
//   [1]  sram_progress_flags
//   [2]  sram_progress_indicator_3
//   [3]  link_item_flippers
//   [4]  link_item_boots
//   [5]  link_item_bug_net
//   [6]  link_item_mirror
//   [7]  link_item_quake_medallion
//   [8]  link_magic_consumption
//   [9]  save_dung_info[0x109] low byte  (Potion Shop room flag)
//   [10] save_dung_info[0x123] low byte  (Mini Moldorm Cave room flag)
//   [11] save_dung_info[0x11E] low byte  (Hype Cave room flag)
//   [12] player_sleep_in_bed_state
//   [13] follower_indicator
//   [14] link_num_keys
//   [15] link_bigkey
//   [16] save_dung_info[0x109] high byte
//   [17] save_dung_info[0x123] high byte
//   [18] save_dung_info[0x11E] high byte
// A room word's chest/item bits span the full 16 bits (CHEST_OPEN_MASKS runs up
// to 0x400), so the three tracked rooms each carry both the low byte (already
// here) and a high byte appended at the end, rather than widening [9]-[11] in
// place and reshuffling every other index in this buffer.
//   [19] which_starting_point
//   [20] savegame_map_icons_indicator
//   [21] substitution-completion bits, byte 0 (allocation: npc_overrides.c)
//   [22] substitution-completion bits, byte 1
//   [23] link_bomb_upgrades  (the upgrade pond's persisted capacity level, kind 0)
//   [24] link_arrow_upgrades (the upgrade pond's persisted capacity level, kind 1)
//   [25] substitution-completion bits, byte 2
//   [26] wallet ladder index (capacity_profile.c; 0 on a vanilla file)
//   [27] explosives empty-rung flag (capacity_profile.c, SRM_EMPTY_RUNG + 0 in
//        save_bytes.h; 0 on a vanilla file)
//   [28] projectiles empty-rung flag (SRM_EMPTY_RUNG + 1)
//   [29] meter empty-rung flag (SRM_EMPTY_RUNG + 2)
//   [30] pond throws taken (pond_plan.c, SRM_POND_THROWS in save_bytes.h; 0 on a vanilla
//        file). A planned pond hands prize k over on a known throw, so the counter is the
//        completion fact for every prize slot past the two the native tier bytes cover.
static uint8 g_progress_buf[31];

EMSCRIPTEN_KEEPALIVE
int WasmGetProgressFlags(void) {
  if (!FlagQueryGate()) {
    memset(g_progress_buf, 0, sizeof(g_progress_buf));
    return (int)g_progress_buf;
  }
  g_progress_buf[0] = sram_progress_indicator;
  g_progress_buf[1] = sram_progress_flags;
  g_progress_buf[2] = sram_progress_indicator_3;
  g_progress_buf[3] = link_item_flippers;
  g_progress_buf[4] = link_item_boots;
  g_progress_buf[5] = link_item_bug_net;
  g_progress_buf[6] = link_item_mirror;
  g_progress_buf[7] = link_item_quake_medallion;
  g_progress_buf[8] = link_magic_consumption;
  g_progress_buf[9] = (uint8)(save_dung_info[0x109]);
  g_progress_buf[10] = (uint8)(save_dung_info[0x123]);
  g_progress_buf[11] = (uint8)(save_dung_info[0x11E]);
  g_progress_buf[12] = player_sleep_in_bed_state;
  g_progress_buf[13] = follower_indicator;  // tagalong id (0 = none); NPC-presence gate
  g_progress_buf[14] = link_num_keys;       // key grants/spends are observable progress
  g_progress_buf[15] = (uint8)link_bigkey;  // big-key grants are observable progress
  g_progress_buf[16] = (uint8)(save_dung_info[0x109] >> 8);
  g_progress_buf[17] = (uint8)(save_dung_info[0x123] >> 8);
  g_progress_buf[18] = (uint8)(save_dung_info[0x11E] >> 8);
  // Scripted-scene checkpoints the run cannot otherwise observe. The first is the
  // starting-point id the game stamps as each opening scene completes; the second
  // is the map-marker state the eastern sage sets once he has given his errand.
  g_progress_buf[19] = which_starting_point;
  g_progress_buf[20] = savegame_map_icons_indicator;
  // The persistent substitution-completion bits (see npc_overrides.c) — the real
  // "taken" facts for the possession-gated givers a randomizer session substitutes.
  // Zero on any vanilla profile: only a gated substitution ever writes them.
  g_progress_buf[21] = GameHook_SubstitutionTakenByte(0);
  g_progress_buf[22] = GameHook_SubstitutionTakenByte(1);
  // The upgrade pond's persisted purchase levels — the vanilla-session completion
  // facts for the two capacity checks — plus the third substitution byte (the
  // synthetic-key grants: the pond purchases and the cave bat).
  g_progress_buf[23] = link_bomb_upgrades;
  g_progress_buf[24] = link_arrow_upgrades;
  g_progress_buf[25] = GameHook_SubstitutionTakenByte(2);
  // The wallet ladder index a Custom wallet profile climbs (the hook-owned save byte).
  g_progress_buf[26] = GameHook_WalletLadderIndex();
  // The empty-rung flags: a Custom family that starts below its native grid stays on rung 0
  // with its tier byte at 0 until the first climb clears the flag — the completion fact for
  // a pond purchase from that rung, which the tier byte alone cannot show.
  g_progress_buf[27] = GameHook_CapacityEmptyRungFlag(0);
  g_progress_buf[28] = GameHook_CapacityEmptyRungFlag(1);
  g_progress_buf[29] = GameHook_CapacityEmptyRungFlag(2);
  // How much of a planned pond this file has already spent — the completion fact for its
  // prize slots, which record no substitution bit of their own (the counter never rewinds,
  // so it already says which prizes are gone). Zero on any file that never met a plan.
  g_progress_buf[30] = GameHook_PondThrowsTaken();
  return (int)g_progress_buf;
}
