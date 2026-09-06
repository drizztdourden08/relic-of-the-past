// @layer core-wasm-build @kind native
// Deferred sub-volumes: a volume set before the player and its DSP exist is held here and
// applied on the first frame that has them. Its own file so the group set can grow without
// crowding the main loop, where the flush is one call.
#include <stdint.h>
#include "snes/dsp.h"
#include "src/types.h"
#include "src/spc_player.h"
#include "src/zelda_rtl.h"
#include "emscripten_internal.h"

int g_pending_music_volume = -1;
int g_pending_ambient_volume = -1;
int g_pending_sfx_volume = -1;

void FlushPendingVolumes(void) {
  if (!g_zenv.player || !g_zenv.player->dsp)
    return;
  if (g_pending_music_volume >= 0) {
    dsp_setMusicVolume(g_zenv.player->dsp, (uint8_t)g_pending_music_volume);
    g_pending_music_volume = -1;
  }
  if (g_pending_ambient_volume >= 0) {
    dsp_setAmbientVolume(g_zenv.player->dsp, (uint8_t)g_pending_ambient_volume);
    g_pending_ambient_volume = -1;
  }
  if (g_pending_sfx_volume >= 0) {
    dsp_setSfxVolume(g_zenv.player->dsp, (uint8_t)g_pending_sfx_volume);
    g_pending_sfx_volume = -1;
  }
}
