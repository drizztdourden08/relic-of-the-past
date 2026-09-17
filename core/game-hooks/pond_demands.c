/* @layer core-game-hooks @kind native */
// What each rung of a planned pond asks for, one table for all three ponds (pond_demands.h has
// the keys and the kinds). The rupee pond (pond_plan.c) and the two item-throwing waters
// (wish_pond_plan.c) read the same rows, so a demand is stored, tested and taken one way
// wherever it is thrown.
//
// A rung is a prize: position k in the pond's prize list. At the rupee pond that is prize
// ordinal k of its throw schedule (GameHook_PondPrizeSlot), at a wish pond rung k of the water's
// ladder. A rupee pond throw that carries no prize has no row here and keeps its own price.
//
// This is host-armed session state and nothing else. It is never a save byte and never a field
// of a struct the save-state snapshot sizes: the host arms it again at every session start from
// the placement, and each pond's throw counter in save_bytes.h stays the only thing a file
// remembers about a pond.
//
// The visit that charges a demand is pond_demand_visit.c, which both handlers reach through
// their own seams. Nothing here changes what the game computes: the setters only record, the
// same contract as every override table, and the reads are raw reads gated by their caller.
#include "game_hooks_internal.h"

static PondDemand g_demand[POND_DEMAND_PONDS][POND_DEMAND_RUNGS];

// A rung's lines, and whether the host armed them: zero-filled means none, so the clear below
// needs no second pass to write -1 back.
static struct {
  uint8 armed;
  PondDemandLines lines;
} g_lines[POND_DEMAND_PONDS][POND_DEMAND_RUNGS];

// The demand of rung |rung| at pond |pond|, or false when none is armed there (kind none, an
// unarmed pond, or keys out of range). |out| is untouched on false.
bool GameHook_PondDemand(int pond, int rung, PondDemand *out) {
  if (pond < 0 || pond >= POND_DEMAND_PONDS) return false;
  if (rung < 0 || rung >= POND_DEMAND_RUNGS) return false;
  if (g_demand[pond][rung].kind == kPondDemand_None) return false;
  *out = g_demand[pond][rung];
  return true;
}

// The lines of rung |rung| at pond |pond|; -1 in every field when none are armed there.
void GameHook_PondDemandLines(int pond, int rung, PondDemandLines *out) {
  *out = (PondDemandLines){-1, -1, -1};
  if (pond < 0 || pond >= POND_DEMAND_PONDS) return;
  if (rung < 0 || rung >= POND_DEMAND_RUNGS) return;
  if (g_lines[pond][rung].armed) *out = g_lines[pond][rung].lines;
}

// Record the demand of one rung. |kind| is a kPondDemand_* tag, |amount| the counted amount
// (rupees, arrows, bombs, whole hearts, or how many bottles), |native_id| the bottle-slot value
// a bottle demand names or the receive id an item demand names. A tag out of range records none.
EMSCRIPTEN_KEEPALIVE
void WasmArmPondDemand(int pond, int rung, int kind, int amount, int native_id) {
  if (pond < 0 || pond >= POND_DEMAND_PONDS) return;
  if (rung < 0 || rung >= POND_DEMAND_RUNGS) return;
  bool known = kind > kPondDemand_None && kind <= kPondDemand_Item;
  g_demand[pond][rung] = known ? (PondDemand){(uint8)kind, (uint8)native_id, (uint16)amount}
                               : (PondDemand){kPondDemand_None, 0, 0};
  printf("[Randomizer] Pond %d rung %d demand: kind %d, amount %d, id 0x%02x\n", pond, rung,
         known ? kind : kPondDemand_None, amount, native_id);
}

// Record the three lines of one rung (PondDemandLines). -1 for any of them keeps that beat on
// the pond's own line.
EMSCRIPTEN_KEEPALIVE
void WasmSetPondDemandLines(int pond, int rung, int ask, int refuse, int award) {
  if (pond < 0 || pond >= POND_DEMAND_PONDS) return;
  if (rung < 0 || rung >= POND_DEMAND_RUNGS) return;
  g_lines[pond][rung].armed = 1;
  g_lines[pond][rung].lines = (PondDemandLines){(int16)ask, (int16)refuse, (int16)award};
  printf("[Randomizer] Pond %d rung %d demand lines: ask %d, refuse %d, award %d\n", pond, rung, ask, refuse, award);
}

// Empty every pond's demands and their lines. Its own clear, apart from each pond plan's, so
// arming one pond's plan can never wipe another pond's demands.
EMSCRIPTEN_KEEPALIVE
void WasmClearPondDemands(void) {
  memset(g_demand, 0, sizeof(g_demand));
  memset(g_lines, 0, sizeof(g_lines));
  printf("[Randomizer] Cleared the pond demands\n");
}
