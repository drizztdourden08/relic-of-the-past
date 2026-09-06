/* @layer core-game-hooks @kind native */
// Session dialogue supplement — swaps the live dialogue blob for a host-composed one.
//
// The baked asset blob is shared per ROM across every profile, so per-seed receipt
// text can never live there. Instead the host composes a full dialogue blob at
// randomizer session start — the active language's baked lines byte-identical, plus
// one pre-rendered contextual line per planned grant — writes it to the virtual FS,
// and this file adopts it: g_zenv.dialogue_blk is repointed at a private copy, and
// restored to the baked blob when the session ends. The blob format is exactly what
// ZeldaSetLanguage selects (index 0 = dictionary, index 1 = per-line dialogue), so
// the vendored text engine reads it with no further changes.
//
// The host re-composes and re-adopts the blob mid-session whenever a line's numbers
// move (a found/total count the tracker advanced). That swap is safe at any frame
// boundary: the text engine copies a message out of the blob into its own buffer when
// the message opens (messaging.c Text_LoadCharacterBuffer) and never reads the blob
// while the box shows, so freeing the previous copy here cannot pull text from under
// a live box. The host keeps the pool's size and order, so every armed id stays valid.
//
// Ungated by design: the supplement carries the baked lines unchanged, so adopting
// it is behavior-neutral outside the randomizer's own message ids — and the message
// SUBSTITUTION stays gated at its application site (receipt_messages.c).
#include <stdlib.h>
#include "game_hooks_internal.h"
#include "src/util.h"

static const char kSessionDialoguePath[] = "session_dialogue.bin";

// The adopted copy (owned here) and the baked blob it replaced.
static uint8 *g_session_dialogue = NULL;
static MemBlk g_baked_dialogue = { NULL, 0 };

// Line count of a packed dialogue blob, for the adoption log line.
static int DialogueLineCount(MemBlk blob) {
  MemBlk lines = FindIndexInMemblk(blob, 1);
  if (lines.ptr == NULL || lines.size < 2) return 0;
  size_t mx = *(uint16 *)(lines.ptr + lines.size - 2);
  if (mx >= 8192) mx -= 8192;
  return (int)mx + 1;
}

// Adopt the host-composed blob written to the session file. Returns the blob's line
// count, or 0 when the file is missing or malformed (the baked blob stays active).
EMSCRIPTEN_KEEPALIVE
int WasmLoadSessionDialogue(void) {
  size_t length = 0;
  uint8 *data = ReadWholeFile(kSessionDialoguePath, &length);
  if (data == NULL) {
    printf("[Randomizer] Session dialogue: no %s to load\n", kSessionDialoguePath);
    return 0;
  }
  MemBlk blob = { data, length };
  if (FindIndexInMemblk(blob, 1).ptr == NULL) {
    printf("[Randomizer] Session dialogue: malformed blob (%d bytes) — keeping the baked dialogue\n",
           (int)length);
    free(data);
    return 0;
  }
  // Remember the baked blob once, before the first swap, so clear can restore it.
  if (g_baked_dialogue.ptr == NULL) g_baked_dialogue = g_zenv.dialogue_blk;
  free(g_session_dialogue);
  g_session_dialogue = data;
  g_zenv.dialogue_blk = blob;
  int lines = DialogueLineCount(blob);
  printf("[Randomizer] Session dialogue adopted: %d lines (%d bytes)\n", lines, (int)length);
  return lines;
}

// Restore the baked dialogue blob and drop the session copy.
EMSCRIPTEN_KEEPALIVE
void WasmClearSessionDialogue(void) {
  if (g_session_dialogue == NULL) return;
  if (g_baked_dialogue.ptr != NULL) g_zenv.dialogue_blk = g_baked_dialogue;
  free(g_session_dialogue);
  g_session_dialogue = NULL;
  printf("[Randomizer] Session dialogue cleared — baked dialogue restored\n");
}
