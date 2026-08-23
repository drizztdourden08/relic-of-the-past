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

// The entrance the music context should carry. Usually the door the player last used — except
// right after a death or save-quit respawn, when that door is wherever the player happened to die.
// A respawn names a ROOM (the starting-point table), so the spawn hook below resolves it to that
// room's own entrance and holds it here until the player next uses a real door.
static int s_spawn_entrance = -1;

static int EffectiveEntrance(void) {
  return s_spawn_entrance >= 0 ? s_spawn_entrance : which_entrance;
}

void GameHook_MusicCtrl(uint8 music_ctrl) {
  // Off by default: makes zero host-calls until the host claims music.
  if (!GameHook_MusicExternal())
    return;

  EM_ASM({
    if (typeof window !== 'undefined' && window.__onMusicCtrl) {
      window.__onMusicCtrl($0, $1, $2, $3);
    }
  }, music_ctrl, main_module_index, EffectiveEntrance(), BYTE(overworld_area_index));
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

// ─── Announcing on attach ───
//
// The mirror image of the restore above. A host that attaches while the game is already running —
// after a save state was loaded at boot, or simply because its audio context came up late — has
// missed every control write so far, and nothing will repeat them: the port is only written when
// the music CHANGES. So the host asks, once its handlers are armed, and the current track and bed
// are reported again as if they had just been selected.
//
// `music_unk1` is what the game considers playing. After a fade it holds the fade byte instead of a
// track, and there is nothing to announce then: the fade already reached the host if it was
// listening, and if it was not, the next real select will.
//
// The chip is silenced on the way: it has been producing the music and the bed up to this moment,
// and handing them over without stopping it would play both at once.
// The game's own "no bed" command. RAISED through the game's ambient variable rather than written
// to the port: the ambient port is guarded by a per-frame handshake that rewrites it while a bed
// plays, so an injected write is erased before the chip consumes it — deterministically, not as a
// race. Asking the game to raise the clear itself rides the same path every real ambient rides,
// and nothing in that path fights it.
enum { kAmbientClearId = 5 };

void GameHook_MusicAnnounce(void) {
  if (!GameHook_MusicExternal())
    return;
  ZeldaApuLock();
  if (music_unk1 != 0 && (music_unk1 & 0xf0) != 0xf0) {
    GameHook_MusicCtrl(music_unk1);
    zelda_apu_write(APUI00, 0xf0);
  }
  // The id the game is playing as ambience. A claimed one is diverted to the host, and the game
  // is asked to raise the clear so the chip's own copy stops; an unclaimed one no-ops here, which
  // is right — the chip is already producing it.
  if (sound_effect_ambient_last != 0 && GameHook_Sound(kSoundChannel_Ambient, sound_effect_ambient_last))
    sound_effect_ambient = kAmbientClearId;
  ZeldaApuUnlock();
}

// ─── Entrance music for an extended pack ───
//
// An extended pack gives some interiors a track of their own, and the host's remap picks it by
// entrance — but only when the game SELECTS a track on the way in. Two kinds of entrance never do:
// one whose table byte is the duck command (0xf2: keep the overworld music, quieter), and one whose
// byte is an overworld song carried indoors (the starting house, whose byte is the village theme).
// Both leave the host remapping by overworld area, so the interior plays the field theme outside.
//
// The fix has to be here rather than in the host, because the byte decides the EXIT as well: the
// way out fades a real track and re-selects the overworld on arrival, but passes a duck straight
// through and restores the overworld volume on arrival — which, with a substituted track, would
// un-duck the interior's music outside. Handing back a real indoor song (16 — remapped by entrance
// on the host, and the cave song the game itself substitutes for a duck once the rain is over)
// makes the way in and the way out agree.
//
// Which entrances have a track of their own is the host's knowledge, pushed as a bitmask when its
// pack is loaded, so this file never carries a copy of the pack's table.
enum { kDeluxeEntranceWords = 5 };   // 133 entrances, 32 per word
static uint32 s_deluxe_entrances[kDeluxeEntranceWords];

void GameHook_SetDeluxeEntrances(int index, uint32 bits) {
  if ((unsigned)index < (unsigned)kDeluxeEntranceWords)
    s_deluxe_entrances[index] = bits;
}

static bool DeluxeEntranceHasTrack(int entrance) {
  if ((unsigned)entrance >= kDeluxeEntranceWords * 32u)
    return false;
  return (s_deluxe_entrances[entrance >> 5] >> (entrance & 31)) & 1;
}

static bool IsOverworldSong(uint8 track) {
  return track == 2 || track == 5 || track == 7 || track == 9 || track == 13;
}

// The stage of the game at which the opening storm ends: the princess has been rescued.
enum { kProgress_StormOver = 2 };

// Asks the host whether |track| is, after its remapping, the music already playing. -1 when the
// host is not in a position to say (external music off, or no handler), and the caller falls back
// to the vanilla compare.
//
// This exists because "is this track playing" is the wrong question for a per-area pack: two
// neighbouring areas share one vanilla byte and play different tracks, so the game's own compare
// answers yes at exactly the edges where the music should change. The removed chip-side player
// had the same problem and the same fix — its version of the compare ran the remap first.
int GameHook_MusicIsPlayingRemapped(uint8 track) {
  if (!GameHook_MusicExternal())
    return -1;
  return EM_ASM_INT({
    if (typeof window !== 'undefined' && window.__msuIsPlaying) {
      return window.__msuIsPlaying($0, $1, $2, $3) ? 1 : 0;
    }
    return -1;
  }, track, main_module_index, EffectiveEntrance(), BYTE(overworld_area_index));
}

uint8 GameHook_EntranceMusic(int entrance, uint8 vanilla) {
  // A real door supersedes any spawn override — the door IS the entrance from here on.
  s_spawn_entrance = -1;
  if (!GameHook_MusicExternal() || !DeluxeEntranceHasTrack(entrance))
    return vanilla;
  if (vanilla != 0xf2 && !IsOverworldSong(vanilla))
    return vanilla;
  // During the opening storm every interior keeps the storm, ducked, the way the game already
  // treats nearly all of them — the one exception being the starting house, whose byte selects the
  // village theme outright. The pack's interior tracks are for the game proper; cutting the storm
  // for one of them on the way back in breaks the one scene the game stages as continuous.
  if (sram_progress_indicator < kProgress_StormOver)
    return 0xf2;
  return 16;
}

// ─── The bed after a state load ───
//
// A restored snapshot brings the sound chip back mid-note: its RAM held the bed it was playing,
// so it resumes it on its own. Re-raising the id through the hook is only half the job — when the
// host claims it, the chip's copy has to STOP, or both play at once. The same clear the announce
// path uses does it; an unclaimed id changes nothing, and the resumed chip bed is the right sound.
void GameHook_AmbientAfterLoad(uint8 last_ambient) {
  if (!HostGate(kHostGate_ExternalAmbient))
    return;
  // Reported UNCONDITIONALLY — zero and unclaimed ids included, which GameHook_Sound never
  // passes. The host's bed belongs to the PREVIOUS state until it is told otherwise: a loaded
  // state with no bed, or with one the pack has nothing for, has to stop whatever the host was
  // playing, or the old state's rain keeps falling in the new state's silence.
  uint8 id = last_ambient & 0x3f;
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onGameSound) {
      window.__onGameSound($0, $1, $2);
    }
  }, kSoundChannel_Ambient, id, last_ambient & 0xc0);
  // A claimed bed is the host's to produce, so the chip's restored copy stops — by asking the
  // game to raise the clear, since the snapshot restored the chip mid-note. An unclaimed one is
  // the chip's, and the report above already stopped the host's.
  if (id != 0 && GameHook_SoundClaimed(kSoundChannel_Ambient, id))
    sound_effect_ambient = kAmbientClearId;
}

// ─── Music at a respawn ───
//
// A death or save-quit respawn selects its music from the starting-point table, which the
// entrance override above never sees — and worse, `which_entrance` still names the door used
// BEFORE dying, so an entrance-remapped song would resolve against the wrong interior entirely.
// The starting point names a room, and the entrance serving that room is in the game's own
// entrance table, so the mapping is derived rather than carried as data.
//
// The same substitutions as the door path apply, with one difference: the storm case selects the
// storm outright instead of ducking, because at a respawn there is nothing playing to duck — the
// death sequence took the music with it, and a duck over silence is just silence.
static int EntranceForRoom(uint16 room) {
  int count = (int)(kEntranceData_rooms_SIZE / sizeof(uint16));
  for (int i = 0; i < count; i++) {
    if (kEntranceData_rooms[i] == room)
      return i;
  }
  return -1;
}

enum { kStormTrack = 3 };

uint8 GameHook_StartingPointMusic(int starting_point, uint8 vanilla) {
  if (!GameHook_MusicExternal() || vanilla == 0xff)
    return vanilla;
  if (starting_point < 0 || starting_point >= (int)(kStartingPoint_rooms_SIZE / sizeof(uint16)))
    return vanilla;
  int entrance = EntranceForRoom(kStartingPoint_rooms[starting_point]);
  if (entrance < 0)
    return vanilla;
  s_spawn_entrance = entrance;
  if (!DeluxeEntranceHasTrack(entrance))
    return vanilla;
  if (vanilla == 0xf2 || IsOverworldSong(vanilla))
    return sram_progress_indicator < kProgress_StormOver ? kStormTrack : 16;
  return vanilla;
}
