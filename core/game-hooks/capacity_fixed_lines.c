/* @layer core-game-hooks @kind native */
// The receipt lines of the FIXED-JUMP capacity items, selected by the live rung. A fixed
// id (0x50-0x61, 0x67-0x76) carries its jump, but the capacity it climbs from is only known
// here, when the grant resolves — so the host pre-renders one line per (family, starting
// rung, jump) in the session dialogue and pushes the table below (WasmSetCapacityFixedLine,
// record-only, never persisted, rebuilt at every session start like the plan and the
// wallet table). The resolvers (upgrade_grants.c, wallet_grants.c) read the rung off the
// save bytes before they climb (GameHook_CapacityRungOf / the wallet index) and ask for
// the line of that rung and the steps they actually climbed; a hit replaces the
// location's jump-only line (GameHook_ArmReceiptMessageReplace, gated on
// kFeatures3_ReceiptMessages), a miss — an off-plan rung the host did not pre-render —
// leaves it standing. Nothing here tests a gate: the read side is reached only from
// inside the gated grant seams, and the arm answers to the message gate.
#include "game_hooks_internal.h"
#include "capacity_tiers.h"

#define FIXED_LINE_FAMILIES 4
// The counted families and the meter cover every rung of their short ladders; the wallet
// only the sums its plan can reach. A partition of the hundred-rung ladder into at most
// sixteen distinct jumps stays far below this bound.
#define FIXED_LINE_CAPACITY 1024

typedef struct {
  uint8 family;
  uint8 from_rung;
  uint8 jump;
  int16 msg;
} CapacityFixedLine;

static CapacityFixedLine g_fixed_lines[FIXED_LINE_CAPACITY];
static int g_fixed_line_count;

// The pre-rendered line for a climb of |jump| rungs from |from_rung| in |family|, -1 for none.
int GameHook_CapacityFixedLine(int family, int from_rung, int jump) {
  for (int i = 0; i < g_fixed_line_count; i++) {
    const CapacityFixedLine *line = &g_fixed_lines[i];
    if (line->family == family && line->from_rung == from_rung && line->jump == jump) return line->msg;
  }
  return -1;
}

// Record-only setter, the shared contract: a repeated (family, rung, jump) updates in place.
EMSCRIPTEN_KEEPALIVE
void WasmSetCapacityFixedLine(int family, int from_rung, int jump, int msg) {
  if (family < 0 || family >= FIXED_LINE_FAMILIES || from_rung < 0 || from_rung > WALLET_LADDER_LAST ||
      jump < 1 || jump > WALLET_LADDER_LAST || msg < 0)
    return;
  for (int i = 0; i < g_fixed_line_count; i++) {
    CapacityFixedLine *line = &g_fixed_lines[i];
    if (line->family == family && line->from_rung == from_rung && line->jump == jump) {
      line->msg = (int16)msg;
      return;
    }
  }
  if (g_fixed_line_count >= FIXED_LINE_CAPACITY) {
    printf("[Randomizer] Capacity fixed lines: table full, family %d rung %d +%d dropped\n", family, from_rung, jump);
    return;
  }
  CapacityFixedLine *line = &g_fixed_lines[g_fixed_line_count++];
  line->family = (uint8)family;
  line->from_rung = (uint8)from_rung;
  line->jump = (uint8)jump;
  line->msg = (int16)msg;
}

EMSCRIPTEN_KEEPALIVE
void WasmClearCapacityFixedLines(void) {
  g_fixed_line_count = 0;
  printf("[Randomizer] Cleared capacity fixed lines\n");
}
