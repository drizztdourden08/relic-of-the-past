/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"
// APUI00 and the APU write helpers: handing music back writes the control port directly.
#include "snes/snes_regs.h"

// ─── Music Control Events ───
//
// Reports every write the game makes to the SPC music-control port, so a host player can
// produce the music instead of the emulated sound chip. The control byte is the game's own
// music command: values below 0xf0 select a track, 0xf0 pauses the player and 0xf1..0xf3 are
// the fade/volume transitions.
//
// A track number alone is not enough to pick an audio file, because the same command means
// different music depending on where the player is — the overworld theme varies by area and
// the indoor themes vary by entrance. Rather than resolve that here, the raw context the
// remapping needs (module, entrance, overworld area) rides along with every event and the
// host does the lookup. Nothing in this file influences emulated state.

void GameHook_MusicCtrl(uint8 music_ctrl) {
  // Off by default: makes zero host-calls until the host claims music.
  if (!GameHook_MusicExternal())
    return;

  EM_ASM({
    if (typeof window !== 'undefined' && window.__onMusicCtrl) {
      window.__onMusicCtrl($0, $1, $2, $3);
    }
  }, music_ctrl, main_module_index, which_entrance, BYTE(overworld_area_index));
}

bool GameHook_MusicExternal(void) {
  return HostGate(kHostGate_ExternalMusic);
}

// ─── Handing music back ───
//
// While the host owns music the control port is held at 0xf0, so the chip's player stays
// paused. Clearing the gate alone does not undo that: the port is only written again when the
// music CHANGES, and `music_unk1` kept tracking the whole time the host was playing, so the
// game considers the track it wants to be already playing and writes nothing. The chip would
// stay silent until the player walked somewhere with different music.
//
// So releasing music has to re-announce the current track, the same way the custom sprite and
// the HUD override each have a restore of their own. Call this BEFORE clearing the gate.
void GameHook_MusicRestore(void) {
  if (!GameHook_MusicExternal())
    return;
  ZeldaApuLock();
  zelda_apu_write(APUI00, music_unk1);
  ZeldaApuUnlock();
}
