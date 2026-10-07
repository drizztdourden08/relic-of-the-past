/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Dialog hook state, carried beside a save ───
// The host message box is drawn from hook statics (dialog_mirror.c and its companions), and a save state
// holds none of them: its layout is fixed and must not grow. A state saved while a message is up would
// therefore load into a game that waits on a button with no words on screen, because the native box was
// never in the saved VRAM and the mirror describes some other moment.
//
// So the host takes these statics at the moment it saves, keeps them in the save file's own metadata
// trailer, and hands them back right after the load. The core's snapshot never sees them.
//
// The blob, version 1:
//   0      version
//   1-2    dialogue_message_index at the save, checked against the loaded game before anything is written
//   3...   mirror, presence, pacing, box owner: each file's own pack, sizes in game_hooks_internal.h
//
// Left out on purpose: the pacing multipliers and switches, and the wanted native-box hide. Those are
// settings the host pushes after every load. The stale mark is left out too: it describes a load, not a
// message, and a mirror that is stale when saved is not offered at all.
//
// Both exports sit behind kFeatures3_HudOverride, the gate WasmGetDialogState reads through. The restore
// also wants the bit in the word the host is asking for now, so a profile that has since turned the
// override off loads the way it always has.

enum { kBlobVersion = 1, kBlobHeader = 3 };
enum {
  kBlobBytes = kBlobHeader + kDialogMirrorPackBytes + kDialogPresencePackBytes + kDialogPacingPackBytes
      + kDialogSuppressPackBytes,
  kOwnerAt = kBlobBytes - kDialogSuppressPackBytes,
};

// Two length bytes ahead of the blob, so one call hands the host both the pointer and the size.
static uint8 g_frozen[2 + kBlobBytes];

// Nothing to carry with no message up, and nothing worth carrying from a mirror that is itself stale.
EMSCRIPTEN_KEEPALIVE
int WasmGetDialogHookState(void) {
  if (!HudOverride_Allowed() || messaging_module == 0 || DialogMirror_Stale()) return 0;
  PutU16(g_frozen, 0, kBlobBytes);
  uint8 *b = g_frozen + 2;
  b[0] = kBlobVersion;
  PutU16(b, 1, dialogue_message_index);
  b += kBlobHeader;
  DialogMirror_Pack(b);
  b += kDialogMirrorPackBytes;
  DialogPresence_Pack(b);
  b += kDialogPresencePackBytes;
  DialogPacing_Pack(b);
  b += kDialogPacingPackBytes;
  DialogSuppress_Pack(b);
  return (int)(intptr_t)g_frozen;
}

// A blob that says the native box was withheld fits only a session that draws the host box. Without one
// the loaded picture has no words and nobody to draw them, which is the plain stale load.
static bool OwnerFits(const uint8 *blob) {
  bool was_hidden = blob[kOwnerAt] != 0 && blob[kOwnerAt + 1] != 0;
  return !was_hidden || HudOverride_DialogHidden();
}

// Call after WasmLoadState and after the settings are pushed again: the pacing push clears the step
// credit and the fill latch, which this puts back. Returns 1 when the statics were restored. Any
// mismatch returns 0 with nothing written, and the caller marks the mirror stale as before.
EMSCRIPTEN_KEEPALIVE
int WasmRestoreDialogHookState(const uint8 *blob, int length) {
  if (!HudOverride_Allowed() || !(g_wanted_gate_words[3] & kFeatures3_HudOverride)) return 0;
  if (blob == NULL || length != kBlobBytes || blob[0] != kBlobVersion) return 0;
  if (messaging_module == 0 || (blob[1] | (blob[2] << 8)) != dialogue_message_index) return 0;
  if (!OwnerFits(blob)) return 0;
  const uint8 *b = blob + kBlobHeader;
  DialogMirror_Unpack(b);
  b += kDialogMirrorPackBytes;
  DialogPresence_Unpack(b);
  b += kDialogPresencePackBytes;
  DialogPacing_Unpack(b);
  b += kDialogPacingPackBytes;
  DialogSuppress_Unpack(b);
  return 1;
}
