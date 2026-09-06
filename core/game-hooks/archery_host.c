/* @layer core-game-hooks @kind native */
// The archery host's refusal: the fee is not taken for a game that cannot be played.
//
// The host takes a fee and hands over five shots. Two things can make those five shots
// worthless before the first is fired, and the game as it shipped takes the fee in both
// cases and says nothing at all:
//
//   - NO BOW. The fee can be paid with an empty bow slot, and the five shots are then
//     unfirable because the bow cannot even be selected. That is a wart rather than a
//     rule, and closing it is a divergence in its own right, so it carries its own gate
//     (kFeatures3_ArcheryNeedsBow) and applies whether or not retro is on.
//
//   - RETRO, QUIVER UNBOUGHT. Retro reads the arrow counter as the "may this bow
//     fire at all" flag (retro_bow.c), so a fee paid before that one purchase buys five
//     shots the shot seam refuses one after another. That hole is retro's own making and
//     sits behind kFeatures3_RetroBow, which is also why it is asked here as "would the
//     shot seam refuse", rather than as a second copy of the same condition.
//
// The reference randomizer reaches the retro half from the other end: it lets the game
// start and refunds the fee out of the shot routine (retro.asm ArrowGame). Refusing the
// fee up front costs the player the same nothing and, unlike a silent refund, tells them
// why they cannot play.
//
// ONE seam, the host's own accept/refuse branch (sprite_main.c ArcheryGame_Host): a guard
// on the condition he always tested, and the line his refusal shows. Both gates clear, or
// nothing to object to, and the guard hands the caller's own expression straight back and
// the line is the vendored one, so the branch is exactly what it was.
//
// No save byte and no WRAM of its own: the latch below lives for the two calls of one
// branch in one frame, so a save state carries no trace of it.
#include "game_hooks_internal.h"

// The value link_item_bow carries with nothing in the slot. Above it the bow is owned at
// some rung (hud.c writes 1/2 for the plain one and 3/4 once it has climbed to silver).
#define ARCHERY_NO_BOW 0

// The host's refusal, position 5 of the randomizer template lines the language bake appends after
// the canonical vanilla ones. Same frozen contract kReceiptMsg_* answers to (game_hooks.h): the
// order here MUST match the template list in
// shared/asset-extraction/text/data/randomizer-templates.ts.
#define ARCHERY_NO_BOW_MSG (kReceiptMsgBase + 5)

// Set by the guard when IT was what refused, read by the message call that follows it in
// the same branch, the same frame. False at every other moment, so a refusal the vendored
// condition made on its own keeps the vendored line.
static bool g_host_refused;

// Would the five shots the fee buys be unfirable? Each reason answers to its own gate, and
// either one alone is enough to refuse.
static bool HostObjects(void) {
  if ((enhanced_features3 & kFeatures3_ArcheryNeedsBow) != 0 && link_item_bow == ARCHERY_NO_BOW)
    return true;
  // The shot seam's own refusal (retro_bow.c GameHook_BowShotSpend), asked one purchase
  // before it would bite: under retro the counter IS the quiver, and no bow means no
  // shot either way.
  return GameHook_RetroBowActive() &&
         (link_item_bow == ARCHERY_NO_BOW || link_num_arrows == 0);
}

// The line the host says when the guard is what refused. A blob baked before the line
// existed stops short of the id, and an index past its end would open an empty box, so the
// vendored line is said instead. The fee is still not taken either way, which is the half
// that costs the player something.
static int RefusalLine(int vendored_msg) {
  if (DialogueLineExists(ARCHERY_NO_BOW_MSG)) return ARCHERY_NO_BOW_MSG;
  printf("[Randomizer] Archery refusal line %d not in the dialogue blob (stale assets?), keeping %d\n",
         ARCHERY_NO_BOW_MSG, vendored_msg);
  return vendored_msg;
}

bool GameHook_ArcheryHostAccepts(bool vendored_ok) {
  g_host_refused = false;
  if (!vendored_ok) return false;
  g_host_refused = HostObjects();
  if (g_host_refused) {
    printf("[Randomizer] Archery host refused the fee: bow %d, arrow counter %d\n",
           link_item_bow, link_num_arrows);
  }
  return !g_host_refused;
}

int GameHook_ArcheryRefusalMessage(int vendored_msg) {
  if (!g_host_refused) return vendored_msg;
  g_host_refused = false;
  return RefusalLine(vendored_msg);
}

// Headless probe: the host's branch as the vendored code runs it, both calls in order,
// without an archery room to stand in. Returns 0 when the fee would be taken, otherwise
// the message id the refusal shows, so one reading carries both halves. Gated on the
// REQUESTED developer-tools bit like every other probe (capacity_probes.c), because the
// gate word only lands in WRAM inside the first frame a harness runs.
EMSCRIPTEN_KEEPALIVE
int WasmProbeArcheryHost(int vendored_ok, int vendored_msg) {
  if ((g_wanted_gate_words[0] & kFeatures0_DeveloperTools) == 0) return -1;
  bool accepts = GameHook_ArcheryHostAccepts(vendored_ok != 0);
  int msg = GameHook_ArcheryRefusalMessage(vendored_msg);
  return accepts ? 0 : msg;
}
