/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Sound Effect Claims ───
//
// Reports the sound effects the game asks its chip to play, so a host player can produce them
// instead. The music side takes a whole channel at once, but a sound effect cannot work that way:
// a host that has one replacement sample must not silence the hundreds it has nothing for. So the
// takeover is per sound id: the host CLAIMS the ids it can play, and only a claimed id is diverted.
//
// The value the game writes to a port is not a bare id: pan rides in the top two bits (0x80 = left,
// 0x40 = right, see CalculateSfxPan), which leaves the low 6 bits as the id and 64 ids per channel.
// That is why a claim is two 32-bit words and not a list, and why the pan is reported separately
// instead of being folded into the id the host looks up.
//
// A claim lives in a plain host-side global, never in WRAM: the game core cannot observe it, so it
// costs no save-state bytes and can never desynchronise a replay. Nothing here influences emulated
// state. The only effect is that the caller skips writing a claimed sound to the chip.

// 64 ids per channel, two words each. Ambient and the two sfx channels each keep their own set: the
// same id means a different sound depending on which port it was written to.
static uint32 s_claim[kSoundChannel_Count][2];

// Ambient has its own gate bit; the two sfx channels share one, because they are a single
// user-facing switch, and the game picks between them by which one happens to be free, not by kind.
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

// Whether the host claims |id| on |channel|. The predicate alone, with no report and no gate check.
// For the paths that must act on claim-ness without implying a sound was just raised.
bool GameHook_SoundClaimed(int channel, uint8 id) {
  if ((unsigned)channel >= (unsigned)kSoundChannel_Count)
    return false;
  return (s_claim[channel][(id & 0x3f) >> 5] & (1u << (id & 31))) != 0;
}

// Set when the hook layer itself raises the ambient clear, cleared by the report that consumes it.
// See GameHook_MarkSelfRaisedAmbientClear in game_hooks.h for why the two clears must not be confused.
static bool s_self_raised_clear;

void GameHook_MarkSelfRaisedAmbientClear(void) {
  s_self_raised_clear = true;
}

// Diagnostics: every raise, claimed or not, with no say in what the chip does with it. The trace is
// deliberately separate from the report below so that turning it on cannot move a single sound from
// the chip to the host, since an instrument that changes what it measures is worse than none. Exported
// so the one report that bypasses GameHook_Sound (the bed re-raised after a state load) can trace too.
void GameHook_TraceSound(int channel, uint8 id, uint8 pan, bool claimed) {
  if (!HostGate(kHostGate_SoundTrace))
    return;
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onSoundTrace) {
      window.__onSoundTrace($0, $1, $2, $3);
    }
  }, channel, id, pan, claimed ? 1 : 0);
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

  uint8 id = raw & 0x3f;
  bool claimed = (s_claim[channel][id >> 5] & (1u << (id & 31))) != 0;
  GameHook_TraceSound(channel, id, raw & 0xc0, claimed);

  // Off by default: makes zero host-calls until the host claims this channel's sounds.
  if (!HostGate(kSoundChannelGate[channel]))
    return false;

  // The ambient channel is STATEFUL on the host: a bed loops until something replaces it, so the id
  // that ENDS one has to arrive as surely as the id that starts it. The game ends a bed by raising
  // its own "no bed" id, which no pack authors, so a claim-only report never delivers it and the
  // rain outlives the storm. Report every ambient id, and return the claim unchanged so an unclaimed
  // bed still reaches the chip and plays there exactly as before.
  //
  // The one exception is the clear this hook layer raised itself, to silence the chip after handing
  // a bed over. Delivering that would cancel the bed we just handed over.
  bool report = claimed;
  if (channel == kSoundChannel_Ambient && !claimed) {
    report = !s_self_raised_clear;
  }
  if (channel == kSoundChannel_Ambient)
    s_self_raised_clear = false;
  if (!report)
    return claimed;

  EM_ASM({
    if (typeof window !== 'undefined' && window.__onGameSound) {
      window.__onGameSound($0, $1, $2);
    }
  }, channel, id, raw & 0xc0);

  return claimed;
}
