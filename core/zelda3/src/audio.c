#include "audio.h"
#include "zelda_rtl.h"
#include "variables.h"
#include "features.h"
#include "snes/snes_regs.h"
#include "spc_player.h"
#include "config.h"
#include "assets.h"
#include "game_hooks.h"

bool ZeldaIsPlayingMusicTrack(uint8 track) {
  int host = GameHook_MusicIsPlayingRemapped(track);
  if (host >= 0)
    return host != 0;
  return track == music_unk1;
}

bool ZeldaIsPlayingMusicTrackWithBug(uint8 track) {
  int host = GameHook_MusicIsPlayingRemapped(track);
  if (host >= 0)
    return host != 0;
  return track == (enhanced_features2 & kFeatures2_FixPortalMusicRestart ? music_unk1 : last_music_control);
}

uint8 ZeldaGetEntranceMusicTrack(int i) {
  return GameHook_EntranceMusic(i, kEntranceData_musicTrack[i]);
}

void ZeldaPlayMsuAudioTrack(uint8 music_ctrl) {
  GameHook_MusicCtrl(music_ctrl);
  if (GameHook_MusicExternal()) {
    // Keep the SPC music channel silent; JS is producing the music. A real track select
    // pauses the SPC player, the 0xf0-range control bytes pass through untouched.
    ZeldaApuLock();
    zelda_apu_write(APUI00, (music_ctrl & 0xf0) != 0xf0 ? 0xf0 : music_ctrl);
    ZeldaApuUnlock();
    return;
  }
  zelda_apu_write(APUI00, music_ctrl);
}

// Maintain a queue cause the snes and audio callback are not in sync.
struct ApuWriteEnt {
  uint8 ports[4];
};
static struct ApuWriteEnt g_apu_write_ents[16], g_apu_write;
static uint8 g_apu_write_ent_pos, g_apu_write_count, g_apu_total_write;
void zelda_apu_write(uint32_t adr, uint8_t val) {
  g_apu_write.ports[adr & 0x3] = val;
}


void ZeldaPushApuState() {
  ZeldaApuLock();
  g_apu_write_ents[g_apu_write_ent_pos++ & 0xf] = g_apu_write;
  if (g_apu_write_count < 16)
    g_apu_write_count++;
  g_apu_total_write++;
  ZeldaApuUnlock();
}

static void ZeldaPopApuState() {
  if (g_apu_write_count != 0)
    memcpy(g_zenv.player->input_ports, &g_apu_write_ents[(g_apu_write_ent_pos - g_apu_write_count--) & 0xf], 4);
}

void ZeldaDiscardUnusedAudioFrames() {
  if (g_apu_write_count != 0 && memcmp(g_zenv.player->input_ports, &g_apu_write_ents[(g_apu_write_ent_pos - g_apu_write_count) & 0xf], 4) == 0) {
    if (g_apu_total_write >= 16) {
      g_apu_total_write = 14;
      g_apu_write_count--;
    }
  } else {
    g_apu_total_write = 0;
  }
}

static void ZeldaResetApuQueue() {
  g_apu_write_ent_pos = g_apu_total_write = g_apu_write_count = 0;
}

uint8_t zelda_read_apui00() {
  // This needs to be here because the ancilla code reads
  // from the apu and we don't want to make the core code
  // dependent on the apu timings, so relocated this value
  // to 0x648.
  return g_ram[kRam_APUI00];
}

uint8_t zelda_apu_read(uint32_t adr) {
  return g_zenv.player->port_to_snes[adr & 0x3];
}

void ZeldaRenderAudio(int16 *audio_buffer, int samples, int channels) {
  ZeldaApuLock();
  ZeldaPopApuState();
  SpcPlayer_GenerateSamples(g_zenv.player);
  dsp_getSamples(g_zenv.player->dsp, audio_buffer, samples, channels);
  ZeldaApuUnlock();
}

bool ZeldaIsMusicPlaying() {
  return g_zenv.player->port_to_snes[0] != 0;
}

void ZeldaRestoreMusicAfterLoad_Locked(bool is_reset) {
  // Restore spc variables from the ram dump.
  SpcPlayer_CopyVariablesFromRam(g_zenv.player);
  // This is not stored in the snapshot
  g_zenv.player->timer_cycles = 0;

  // Restore input ports state
  SpcPlayer *spc_player = g_zenv.player;
  memcpy(spc_player->input_ports, &spc_player->ram[0x410], 4);
  memcpy(g_apu_write.ports, spc_player->input_ports, 4);

  if (is_reset) {
    SpcPlayer_Initialize(g_zenv.player);
  }

  // A restored snapshot carries the track it was playing, but nothing will announce it: the
  // control port is only written when the music CHANGES, so without this a loaded state stays
  // silent until the player walks somewhere new. Re-announce it, and keep the chip's own music
  // paused, exactly as the removed MSU player did here.
  if (GameHook_MusicExternal()) {
    GameHook_MusicCtrl(music_unk1);
    zelda_apu_write(APUI00, 0xf0);
  }

  // Same problem for a host-played ambient bed, plus one more: the snapshot restored the chip's
  // own player mid-note, so a claimed bed must also silence the chip's resumed copy or both
  // sound at once. The hook does both; an unclaimed id no-ops, and the chip's bed is the sound.
  GameHook_AmbientAfterLoad(sound_effect_ambient_last);

  ZeldaResetApuQueue();
}

void ZeldaSaveMusicStateToRam_Locked() {
  SpcPlayer_CopyVariablesToRam(g_zenv.player);
  // SpcPlayer.input_ports is not saved to the SpcPlayer ram by SpcPlayer_CopyVariablesToRam,
  // in any case, we want to save the most recently written data, and that might still
  // be in the queue. 0x410 is a free memory location in the SPC ram, so store it there.
  SpcPlayer *spc_player = g_zenv.player;
  memcpy(&spc_player->ram[0x410], g_apu_write.ports, 4);
}

void LoadSongBank(const uint8 *p) {  // 808888
  ZeldaApuLock();
  SpcPlayer_Upload(g_zenv.player, p);
  ZeldaApuUnlock();
}
