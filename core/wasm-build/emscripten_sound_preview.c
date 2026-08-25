/* @layer core-wasm-build @kind native */
// Renders what the game's own sound chip would play for one sound id, so the app can audition the
// original next to a replacement.
//
// This runs on a SECOND, private sound chip — its own SpcPlayer, its own DSP, its own 64K of APU
// ram — and never touches the one the game is playing on. That isolation is the whole point: the
// alternative (writing an id to the live chip's port) would mutate emulated state, so it could
// desynchronise a replay, disturb whatever music is actually playing, and would only work while a
// game is running at all. Here nothing observable by the game changes, and a preview works the
// same whether a session is live or the player is only browsing packs.
//
// The audio is not shipped with the app and never could be — it is synthesised on demand from the
// sound banks in the player's own assets file, which is also why this reports "not ready" rather
// than silence when the core has not loaded assets yet.

#include <stdint.h>
#include <stdlib.h>
#include <emscripten.h>

#include "snes/dsp.h"

#include "src/types.h"
#include "src/assets.h"
#include "src/spc_player.h"

// One video frame of chip output: 534 stereo samples at 32040 Hz (see Dsp.sampleBuffer). Asking
// dsp_getSamples for exactly this many copies the frame at its native rate instead of resampling.
enum {
  kPreviewFrameSamples = 534,
  kPreviewRate = 32040,
  // 60 seconds. A one-shot needs a fraction of this and gets trimmed to its own length by the
  // caller; music and an ambient bed never end, so for those a preview is a window and the window
  // has to be long enough to hear a whole phrase against a replacement of similar length.
  kPreviewMaxFrames = 3600,
};

// ~7.7 MB at the cap, so it is allocated on the first preview rather than sitting in the core's
// footprint for every session that never asks for one.
static int16 *s_samples;
static SpcPlayer *s_player;
// Which bank is uploaded, so repeated previews on one bank skip the upload. -1 = nothing yet.
static int s_bank = -1;

// The bank the chip always has: it carries the sound engine and the shared samples, and the game
// uploads it at boot. The other two are uploaded ON TOP of it when the game moves indoors or into
// the credits, replacing the song data and leaving the engine in place — which is why they produce
// nothing at all on their own, and why a set here is a chain rather than a single blob.
static const uint8 *PreviewBankExtra(int bank) {
  switch (bank) {
  case 0: return NULL;               // overworld and intro: the base bank alone
  case 1: return kSoundBank_indoor;  // dungeons
  case 2: return kSoundBank_ending;  // credits
  default: return NULL;
  }
}

static bool PreviewBankValid(int bank) {
  return bank >= 0 && bank <= 2;
}

// True once the assets file is parsed, which is what makes the sound banks readable.
EMSCRIPTEN_KEEPALIVE
int WasmSoundPreviewReady(void) {
  return g_asset_ptrs[0] != NULL;
}

EMSCRIPTEN_KEEPALIVE
int WasmSoundPreviewRate(void) {
  return kPreviewRate;
}

EMSCRIPTEN_KEEPALIVE
int16 *WasmSoundPreviewBuffer(void) {
  return s_samples;
}

EMSCRIPTEN_KEEPALIVE
int WasmSoundPreviewMaxFrames(void) {
  return kPreviewMaxFrames;
}

static int RenderOnBank(int port, int raw, int bank, int frames) {
  if (!PreviewBankValid(bank) || kSoundBank_intro == NULL)
    return 0;

  if (s_samples == NULL) {
    s_samples = (int16 *)malloc(sizeof(int16) * kPreviewFrameSamples * 2 * kPreviewMaxFrames);
    if (s_samples == NULL)
      return 0;
  }

  if (s_player == NULL) {
    s_player = SpcPlayer_Create();
    if (s_player == NULL)
      return 0;
    s_bank = -1;
  }

  // Initialize BEFORE uploading, which is the order the game itself uses and the only one that
  // works: initializing resets the chip by clearing everything from new_value_from_snes to the end
  // of the struct, and that span includes the 64K of APU ram an upload writes the bank into.
  //
  // Both run for every preview, not just on a bank change: a reset plus a fresh upload is what
  // gives each preview the same known quiet chip to start from, instead of the tail of the last one.
  SpcPlayer_Initialize(s_player);
  SpcPlayer_Upload(s_player, kSoundBank_intro);
  const uint8 *extra = PreviewBankExtra(bank);
  if (extra != NULL)
    SpcPlayer_Upload(s_player, extra);
  s_bank = bank;

  for (int i = 0; i < frames; i++) {
    // The game writes an effect port for a single frame and clears it; holding the value would
    // retrigger the sound every frame. Music (port 0) and the ambient bed (port 1) are the
    // opposite — the value stays put, and clearing it is what stops them.
    if (i == 0)
      s_player->input_ports[port] = (uint8)raw;
    else if (port >= 2)
      s_player->input_ports[port] = 0;

    SpcPlayer_GenerateSamples(s_player);
    dsp_getSamples(s_player->dsp,
                   s_samples + (size_t)i * kPreviewFrameSamples * 2,
                   kPreviewFrameSamples, 2);
  }

  return frames * kPreviewFrameSamples;
}

// Loudest sample in the rendered buffer, as the test for "this bank actually has this sound".
static int PeakOf(int sample_frames) {
  if (s_samples == NULL)
    return 0;
  int peak = 0;
  for (int i = 0; i < sample_frames * 2; i++) {
    int v = s_samples[i] < 0 ? -s_samples[i] : s_samples[i];
    if (v > peak)
      peak = v;
  }
  return peak;
}

// Below this a render counts as silence rather than a quiet sound. Chip output for a sound that is
// simply absent from a bank is digital zero, so any real margin above zero separates the two.
enum { kAudibleThreshold = 64 };

// How much to render while deciding which bank holds a sound: a third of a second, which is far
// more than any of them takes to begin.
enum { kBankSearchFrames = 20 };

// Plays |raw| (an id with its pan bits, exactly as the game writes it) on APU port |port| and
// renders |frames| video frames of the result into the preview buffer. Returns the number of
// sample frames written, or 0 if nothing could be rendered.
//
// The port matters as much as the id: the same number means a different sound on each port, which
// is why the caller passes the port rather than a channel index.
//
// A negative |bank| means "find it": each bank holds a different set of songs, and a track number
// on its own does not say which one it belongs to. Rather than make callers keep a table that would
// drift from the assets, the banks are tried in turn and the first that produces something audible
// wins. Sound effects are in every bank, so for those the first try always answers.
EMSCRIPTEN_KEEPALIVE
int WasmRenderSoundPreview(int port, int raw, int bank, int frames) {
  if (!WasmSoundPreviewReady() || (unsigned)port > 3 || raw == 0)
    return 0;

  if (frames < 1)
    frames = 1;
  if (frames > kPreviewMaxFrames)
    frames = kPreviewMaxFrames;

  if (bank >= 0)
    return RenderOnBank(port, raw, bank, frames);

  // Find the bank on a short render, then produce the real one only on the bank that answered.
  // A sound that exists starts within a few frames, so a whole minute of audio is not needed to
  // tell "this bank has it" from "it does not".
  int rendered = 0;
  for (int candidate = 0; candidate <= 2; candidate++) {
    rendered = RenderOnBank(port, raw, candidate, kBankSearchFrames);
    if (rendered > 0 && PeakOf(rendered) >= kAudibleThreshold)
      return frames > kBankSearchFrames ? RenderOnBank(port, raw, candidate, frames) : rendered;
  }
  // Nothing anywhere: hand back a render of the length asked for, so the caller sees a buffer of
  // silence and can report "this one is silent on the chip" rather than "the preview failed".
  return RenderOnBank(port, raw, 0, frames);
}

// Which bank the last render used. Only meaningful straight after WasmRenderSoundPreview.
EMSCRIPTEN_KEEPALIVE
int WasmSoundPreviewBank(void) {
  return s_bank;
}
