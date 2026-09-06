/* @layer core-game-hooks @kind native */
/**
 * Player pose ring — one record per game frame of everything that decides which character
 * tiles are DRAWN: the pose row/step LinkOam_Main resolved, the DMA source indices the NMI
 * uploads from, the handler/timer state that drove that choice, the ancilla slots, and the
 * player's own OAM entries as built this frame. A pose fault shows up here as churn in the
 * dma/pose columns; a stable animation reads as a short windup ramp and then a constant.
 *
 * Captured once per game frame from GameHook_ModuleFrameEnd (after the module ran, before the
 * NMI uploads), so it does not depend on a render happening. Developer-tools gated like the
 * OAM ring: off means no capture and the export returns 0.
 */

#include "game_hooks_internal.h"
#include "wasm_buf.h"

#define POSE_RING_FRAMES 300
#define POSE_RING_STRIDE 96
#define POSE_PLAYER_SLOTS 4

static uint8 g_pose_ring[POSE_RING_FRAMES * POSE_RING_STRIDE];
static uint32 g_pose_ring_write;  // total frames captured; index = write % POSE_RING_FRAMES
static uint8 g_pose_ring_head[12];

/**
 * Record layout (little-endian):
 *   0  u16 frame_counter
 *   2  u8 main module      3  u8 submodule
 *   4  u8 player handler state   5 u8 position mode   6 u8 item in hand   7 u8 handler timer
 *   8  u8 spin-attack delay timer   9 u8 animation steps   10 u8 misc animation timer   11 u8 state bits
 *  12  u8 auxiliary state   13 u8 electrocute flag   14 u8 grabbing wall   15 u8 drag-state mask
 *  16  u8 pose row (yt)   17 u8 pose step (rt)   18 u8 facing   19 u8 direction
 *  20  u16 dma graphics index   22 u16 dma var1   24 u16 dma var2
 *  26  u8 dma var3   27 u8 dma var4   28 u8 dma var5   29 u8 palette swap flag
 *  30  u8 equipped Y item   31 u8 active item   32 u8 B/Y button mask   33 u8 magic
 *  34  u8 visibility status   35 u8 blink countdown   36 u8 cant-change-direction   37 u8 immobilized
 *  38  u8 filtered joypad H   39 u8 joypad H held
 *  40  u8 speed setting   41 u8 bunny mirror   42 u8 pose for item   43 u8 player_unk1
 *  44  u8 master-sword pose   45 u8 near-pit state   46 u8 cape mode   47 u8 force hold sword up
 *  48  u16 x   50 u16 y   52 u16 z
 *  54  u8 debug value 2   55 u8 var30d
 *  56  u8[10] ancilla types   66 u8[5] ancilla steps   71 u8 ancilla-to-pick-up
 *  72  u8 picking/throw state   73 u8 receive-item index   74 u8 receipt method   75 u8 button B frames
 *  76  u8 disable sprite damage   77 u8 give damage   78 u8 incapacitated timer   79 u8 recoil timer
 *  80  4 x { u8 x, u8 y, u8 charnum, u8 flags } — the first four OAM slots flagged as the player
 */
static void PutPlayerOam(uint8 *p) {
  int n = 0;
  for (int i = 0; i < 128 && n < POSE_PLAYER_SLOTS; i++) {
    if (!g_oam_player[i]) continue;
    p[80 + n * 4 + 0] = oam_buf[i].x;
    p[80 + n * 4 + 1] = oam_buf[i].y;
    p[80 + n * 4 + 2] = oam_buf[i].charnum;
    p[80 + n * 4 + 3] = oam_buf[i].flags;
    n++;
  }
}

/** Called once per game frame from GameHook_ModuleFrameEnd. No-op unless developer tools are on. */
void GameHook_CapturePoseFrame(void) {
  if (!(enhanced_features0 & kFeatures0_DeveloperTools))
    return;
  uint8 *p = g_pose_ring + (g_pose_ring_write % POSE_RING_FRAMES) * POSE_RING_STRIDE;
  memset(p, 0, POSE_RING_STRIDE);
  PutU16(p, 0, (uint16)frame_counter);
  p[2] = (uint8)main_module_index;
  p[3] = (uint8)submodule_index;
  p[4] = link_player_handler_state;
  p[5] = link_position_mode;
  p[6] = link_item_in_hand;
  p[7] = player_handler_timer;
  p[8] = link_delay_timer_spin_attack;
  p[9] = link_animation_steps;
  p[10] = some_animation_timer_steps;
  p[11] = link_state_bits;
  p[12] = link_auxiliary_state;
  p[13] = link_electrocute_on_touch;
  p[14] = link_grabbing_wall;
  p[15] = bitmask_of_dragstate;
  p[16] = value_computed_for_player_oam;
  p[17] = (uint8)index_of_interacting_tile;
  p[18] = link_direction_facing;
  p[19] = link_direction;
  PutU16(p, 20, link_dma_graphics_index);
  PutU16(p, 22, link_dma_var1);
  PutU16(p, 24, link_dma_var2);
  p[26] = link_dma_var3;
  p[27] = link_dma_var4;
  p[28] = link_dma_var5;
  p[29] = palette_swap_flag;
  p[30] = current_item_y;
  p[31] = current_item_active;
  p[32] = button_mask_b_y;
  p[33] = link_magic_power;
  p[34] = link_visibility_status;
  p[35] = countdown_for_blink;
  p[36] = link_cant_change_direction;
  p[37] = flag_is_link_immobilized;
  p[38] = filtered_joypad_H;
  p[39] = joypad1H_last;
  p[40] = link_speed_setting;
  p[41] = link_is_bunny_mirror;
  p[42] = link_pose_for_item;
  p[43] = player_unk1;
  p[44] = link_unk_master_sword;
  p[45] = player_near_pit_state;
  p[46] = link_cape_mode;
  p[47] = link_force_hold_sword_up;
  PutU16(p, 48, link_x_coord);
  PutU16(p, 50, link_y_coord);
  PutU16(p, 52, link_z_coord);
  p[54] = link_debug_value_2;
  p[55] = link_var30d;
  for (int k = 0; k < 10; k++) p[56 + k] = ancilla_type[k];
  for (int k = 0; k < 5; k++) p[66 + k] = ancilla_step[k];
  p[71] = flag_is_ancilla_to_pick_up;
  p[72] = link_picking_throw_state;
  p[73] = link_receiveitem_index;
  p[74] = item_receipt_method;
  p[75] = button_b_frames;
  p[76] = link_disable_sprite_damage;
  p[77] = link_give_damage;
  p[78] = link_incapacitated_timer;
  p[79] = link_recoilmode_timer;
  PutPlayerOam(p);
  g_pose_ring_write++;
}

/** Header: u32 total frames captured, u16 ring capacity, u16 stride, u16 ring pointer (low), u16 (high). */
EMSCRIPTEN_KEEPALIVE
int WasmGetPoseRing(void) {
  if (!(enhanced_features0 & kFeatures0_DeveloperTools))
    return 0;
  uint32 ring = (uint32)(uintptr_t)g_pose_ring;
  g_pose_ring_head[0] = (uint8)(g_pose_ring_write & 0xff);
  g_pose_ring_head[1] = (uint8)((g_pose_ring_write >> 8) & 0xff);
  g_pose_ring_head[2] = (uint8)((g_pose_ring_write >> 16) & 0xff);
  g_pose_ring_head[3] = (uint8)((g_pose_ring_write >> 24) & 0xff);
  PutU16(g_pose_ring_head, 4, POSE_RING_FRAMES);
  PutU16(g_pose_ring_head, 6, POSE_RING_STRIDE);
  PutU16(g_pose_ring_head, 8, (uint16)(ring & 0xffff));
  PutU16(g_pose_ring_head, 10, (uint16)(ring >> 16));
  return (int)(uintptr_t)g_pose_ring_head;
}

/**
 * Headless frame step for a host-side harness: runs exactly one game frame with |inputs| in the
 * WasmSetInput bit layout; returns 1 when the frame ran, 0 when refused. The renderer never calls
 * this; the main loop owns stepping there. Gated on the REQUESTED developer-tools bit rather than
 * the WRAM copy, because the gate word only lands in WRAM inside the first frame this call runs.
 */
EMSCRIPTEN_KEEPALIVE
int WasmDevRunFrame(int inputs) {
  if (!(g_wanted_gate_words[0] & kFeatures0_DeveloperTools))
    return 0;
  ZeldaRunFrame(inputs);
  return 1;
}
