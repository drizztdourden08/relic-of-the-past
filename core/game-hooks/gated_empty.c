/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// Some queries hand back a pointer straight into live WRAM: save_dung_info, save_ow_event_info and
// dung_bg2_attr_table are aliases (variables.h), not private buffers. A refused query therefore cannot
// blank the buffer it would have returned, because that would erase real save and collision data out
// from under a running game. It returns this region instead.
//
// One region serves every such export. Nothing ever writes here, so the zeroes cannot be disturbed and
// no caller can reach another export's leftovers; sized to the largest of them (the indoor attribute
// table, 0x2000). A refused query has nothing to report beyond "empty", so they share the answer.
static uint8 g_gated_empty[0x2000];

void *GatedEmpty(void) {
  return g_gated_empty;
}
