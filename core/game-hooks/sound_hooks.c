/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Sound Effect Claims ───
//
// Reports the sound effects the game asks its chip to play, so a host player can produce them
// instead. The music side takes a whole channel at once, but a sound effect cannot work that way:
// a host that has one replacement sample must not silence the hundreds it has nothing for. So the
// takeover is per sound id — the host CLAIMS the ids it can play, and only a claimed id is diverted.
//
// The value the game writes to a port is not a bare id: pan rides in the top two bits (0x80 = left,
// 0x40 = right — see CalculateSfxPan), which leaves the low 6 bits as the id and 64 ids per channel.
// That is why a claim is two 32-bit words rather than a list, and why the pan is reported separately
// instead of being folded into the id the host looks up.
//
// A claim lives in a plain host-side global, never in WRAM: the game core cannot observe it, so it
// costs no save-state bytes and can never desynchronise a replay. Nothing here influences emulated
// state — the only effect is that the caller skips writing a claimed sound to the chip.

// 64 ids per channel, two words each. Ambient and the two sfx channels each keep their own set: the
// same id means a different sound depending on which port it was written to.
static uint32 s_claim[kSoundChannel_Count][2];

// Ambient has its own gate bit; the two sfx channels share one, because they are a single
// user-facing switch — the game picks between them by which one happens to be free, not by kind.
static const uint32 kSoundChannelGate[kSoundChannel_Count] = {
  kHostGate_ExternalAmbient,
  kHostGate_ExternalSfx,
  kHostGate_ExternalSfx,
};

void GameHook_SetSoundClaim(int channel, uint32 low, uint32 high) {
  if ((unsigned)channel >= (unsigned)kSoundChannel_Count)
    return;

  s_claim[channel][0] = low;
  s_claim[channel][1] = high;
}

bool GameHook_Sound(int channel, uint8 raw) {
  // Id 0 is the game's "nothing to play" write, which every frame without a sound effect makes.
  // There is no sound there to replace, and the port still needs it to clear the previous one.
  if (raw == 0)
    return false;

  // Out-of-range indices are ignored, so a renderer built against a newer channel catalog cannot
  // corrupt memory when it talks to an older core.
  if ((unsigned)channel >= (unsigned)kSoundChannel_Count)
    return false;

  // Off by default: makes zero host-calls until the host claims this channel's sounds.
  if (!HostGate(kSoundChannelGate[channel]))
    return false;

  uint8 id = raw & 0x3f;
  if (!(s_claim[channel][id >> 5] & (1u << (id & 31))))
    return false;

  EM_ASM({
    if (typeof window !== 'undefined' && window.__onGameSound) {
      window.__onGameSound($0, $1, $2);
    }
  }, channel, id, raw & 0xc0);

  return true;
}
