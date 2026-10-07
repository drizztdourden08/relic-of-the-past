/* @layer core-game-hooks @kind native */
// The live facts behind the tracker's status pills that no progress byte carries: which world the
// player is in, the bunny form, the crystal switch, and the desert statues' prayer. Read-only, and
// gated like the progress buffer (FlagQueryGate): the tracker's presence snapshot reads it each
// poll next to WasmGetProgressFlags. Kept apart from that buffer on purpose: the simulator diffs
// the progress buffer to detect checks, and two of these flip every screen.
//   [0] in the Dark World (savegame_is_darkworld bit 0x40)
//   [1] bunny form (link_is_bunny)
//   [2] crystal switch flipped from its entry state (orange_blue_barrier_state)
//   [3] the desert statues' prayer in progress or done for this visit (byte_7E02F0)
#include "game_hooks_internal.h"

#define STORY_STATUS_BYTES 4

static uint8 g_story_status_buf[STORY_STATUS_BYTES];

EMSCRIPTEN_KEEPALIVE
int WasmGetStoryStatusBytes(void) {
  if (!FlagQueryGate()) {
    memset(g_story_status_buf, 0, sizeof(g_story_status_buf));
    return (int)g_story_status_buf;
  }
  g_story_status_buf[0] = (savegame_is_darkworld & 0x40) != 0;
  g_story_status_buf[1] = link_is_bunny != 0;
  g_story_status_buf[2] = orange_blue_barrier_state != 0;
  g_story_status_buf[3] = byte_7E02F0 != 0;
  return (int)g_story_status_buf;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetStoryStatusByteCount(void) {
  return STORY_STATUS_BYTES;
}
