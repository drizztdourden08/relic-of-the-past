/* @layer core-game-hooks @kind native */
// Headless probes for the capacity seams — what a node harness calls after WasmInitHeadless
// to prove the seams behave, gate on and gate off; the renderer never calls them. Gated on
// the REQUESTED developer-tools bit like WasmDevRunFrame (state_queries_pose.c), because
// the gate word only lands in WRAM inside the first frame such a harness runs. Three are
// pure reads; WasmProbeMagicUse runs the vendored cost check for item slot |x| exactly as
// an item use would (a refusal leaves the meter untouched, an accepted use deducts the
// cost), and WasmProbeWramPtr hands the harness the WRAM base so it can stage counters and
// read them back through HEAPU8. WasmProbeMagicCapacity is the meter cap the refill drain
// stops at, and WasmProbeNewFileMagic runs the new-file seam over a sentinel-filled block
// and hands back the meter byte it leaves (0x55 = the seam left the template's own byte).
// WasmProbeResolveGrant runs a grant id through GameHook_ResolveGrantItem exactly as a seam
// would — the arithmetic, the message arm, the icon arm — without the receive flow, and
// hands back the presentation item; WasmProbeReceiptMessage reads the armed one-shot.
#include "game_hooks_internal.h"
#include "src/player.h"

static bool ProbeGate(void) {
  return (g_wanted_gate_words[0] & kFeatures0_DeveloperTools) != 0;
}

EMSCRIPTEN_KEEPALIVE
int WasmProbeWramPtr(void) {
  return ProbeGate() ? (int)(uintptr_t)g_ram : 0;
}

EMSCRIPTEN_KEEPALIVE
int WasmProbeCapacityMax(int kind, int level) {
  return ProbeGate() ? GameHook_CapacityMax(kind, level) : -1;
}

EMSCRIPTEN_KEEPALIVE
int WasmProbeWalletMax(int vanilla) {
  return ProbeGate() ? GameHook_WalletMax(vanilla) : -1;
}

EMSCRIPTEN_KEEPALIVE
int WasmProbeMagicCapacity(void) {
  return ProbeGate() ? GameHook_MagicCapacity() : -1;
}

#define NEW_FILE_BLOCK_SIZE 60
#define NEW_FILE_BLOCK_MAGIC_OFFS 0x2E  // link_magic_power (0xF36E) - the block base (0xF340)
#define NEW_FILE_BLOCK_SENTINEL 0x55

EMSCRIPTEN_KEEPALIVE
int WasmProbeNewFileMagic(void) {
  if (!ProbeGate()) return -1;
  uint8 block[NEW_FILE_BLOCK_SIZE];
  memset(block, NEW_FILE_BLOCK_SENTINEL, sizeof(block));
  GameHook_InitNewFileCounters(block);
  return block[NEW_FILE_BLOCK_MAGIC_OFFS];
}

EMSCRIPTEN_KEEPALIVE
int WasmProbeMagicUse(int x) {
  if (!ProbeGate()) return -1;
  return LinkCheckMagicCost((uint8)x) ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int WasmProbeResolveGrant(int item) {
  return ProbeGate() ? GameHook_ResolveGrantItem((uint8)item) : -1;
}

EMSCRIPTEN_KEEPALIVE
int WasmProbeReceiptMessage(void) {
  return ProbeGate() ? GameHook_PeekReceiptMessage() : -1;
}

// Arm |msg| exactly as every substitution table does (the if-clear contract), so a harness
// can drive the arm-then-receive sequence of a chest, a shelf or a standing prize.
EMSCRIPTEN_KEEPALIVE
void WasmProbeArmReceiptMessage(int msg) {
  if (ProbeGate()) GameHook_ArmReceiptMessageIfClear(msg);
}

// Dialogue line |msg| of the LIVE blob, dictionary words expanded exactly as the text
// engine's own load does (messaging.c Text_LoadCharacterBuffer), command bytes kept raw.
// Hands back a buffer holding a u16 length then the bytes, so a harness can read the text
// the core would actually open for an armed message id; 0 when the id is not in the blob.
#define PROBE_LINE_CAPACITY 512
// The first dictionary byte of the packed text (the text engine's own file-private constant).
#define PROBE_DICT_BASE 0x88

static uint8 g_probe_line[2 + PROBE_LINE_CAPACITY];

EMSCRIPTEN_KEEPALIVE
int WasmProbeDialogueLine(int msg) {
  if (!ProbeGate() || msg < 0) return 0;
  MemBlk dictionary = FindIndexInMemblk(g_zenv.dialogue_blk, 0);
  MemBlk dialogue = FindIndexInMemblk(g_zenv.dialogue_blk, 1);
  MemBlk line = FindIndexInMemblk(dialogue, (size_t)msg);
  if (line.ptr == NULL) return 0;
  int n = 0;
  for (size_t i = 0; i < line.size; i++) {
    uint8 c = line.ptr[i];
    if (c < PROBE_DICT_BASE) {
      if (n < PROBE_LINE_CAPACITY) g_probe_line[2 + n++] = c;
      continue;
    }
    MemBlk word = FindIndexInMemblk(dictionary, c - PROBE_DICT_BASE);
    for (size_t k = 0; k < word.size && n < PROBE_LINE_CAPACITY; k++) g_probe_line[2 + n++] = word.ptr[k];
  }
  g_probe_line[0] = (uint8)(n & 0xff);
  g_probe_line[1] = (uint8)(n >> 8);
  return (int)(uintptr_t)g_probe_line;
}
