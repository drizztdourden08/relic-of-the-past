/* @layer core-game-hooks @kind native */
#ifndef GAME_HOOKS_H
#define GAME_HOOKS_H

#include "src/types.h"

// ─── Item Overrides (item_overrides.c) ───

// Returns the replacement item, or |original_item| if no override is set.
uint8 GameHook_OverrideChestItem(uint16 room_id, uint8 original_item);

// ─── Tracker Notifications (game_hooks.c) ───

// Called from Link_ReceiveItem() whenever the player receives an item.
void GameHook_NotifyItemReceived(uint8 item_id, uint8 method);

// ─── Check Triggers (check_triggers.c) ───

// Programmatically trigger a chest check: sets room flag, gives the item,
// plays the hold-up animation, and fires the JS notification.
void GameHook_TriggerCheck(uint16 room_id, uint8 chest_index, uint8 item_id);

// Programmatically trigger an NPC-type check (Uncle, the village elder, etc.)
void GameHook_TriggerNpcCheck(uint8 flag_type, uint8 flag_mask, uint8 item_id,
                              uint8 sprite_type_id, uint8 post_gfx);

// Programmatically trigger a standing-overworld-item check: sets the screen's
// event bit and grants the item.
void GameHook_TriggerOverworldCheck(uint8 screen, uint8 mask, uint8 item_id);

// ─── State Queries (state_queries.c) ───

// True while `effectiveModule` is MODULE_FALLING_ENTRANCE (11) via the vanilla overworld
// special-switch-area path (one of 3 locked-view locations reached by walking onto a
// switch tile) and not an actual dungeon pit-fall. Both reuse the same module;
// overworld_screen_index staying >= 128 is what's unique to the special-area flavor.
// Use this form once a menu-overlay remap has already been resolved (main_module_index
// == 14, the real module in saved_module_for_menu), because passing the raw main_module_index
// there would stop recognizing the special area the instant the pause menu opens over it.
bool GameHook_IsOverworldSpecialAreaFor(int effectiveModule);

// Raw-module form: true while main_module_index itself is the special-area flavor.
// Anything gating on "is this normal interactive gameplay right now" (accepting live
// input) should use this, because it excludes the paused/menu-overlay state, matching
// how a normal overworld location already behaves while paused.
bool GameHook_IsOverworldSpecialArea(void);

// ─── Cheats (cheats.c) ───

// Returns the current outgoing damage multiplier (1 = normal).
uint8 GameHook_GetDamageMultiplier(void);

// Returns extra armor reduction percentage (0-100). Stacks with armor.
uint8 GameHook_GetExtraArmorPct(void);

// Applies the extra-armor cheat to an incoming damage value (no-op at 0%).
uint8 GameHook_ApplyExtraArmor(uint8 dmg);

// Resolves the desired value (0 or 1) for the cheatWalkThroughWalls WRAM byte this frame, gate
// included. Called every frame by zelda_rtl.c's cheat-WRAM reconcile so a save-state restore (which
// overwrites that byte along with the rest of WRAM) never leaves a stale value behind.
uint8 GameHook_GetWantedIgnoreCollision(void);

// ─── View gates (view_gates.c) ───

// True while the lamp's light-cone mask is on the subscreen, so the extended view must collapse to
// the base frame: the mask only covers 256 pixels and its tilemap wraps, so any extra width samples
// a second, undarkened copy of the cone. Covers the room-transition frames where the game clears
// hdr_dungeon_dark_with_lantern while the mask is still being drawn. Wide view only.
bool GameHook_LightConeSuppressesExtraWidth(void);

// ─── Custom player sprite sheets (player_sprite.c) ───

// Overwrite the player gfx asset from a ZSPR sheet and take its palette into the PPU's private player
// bank. |push_live| lands the colors straight away, so pass false before the core is initialized.
// Returns false (assets untouched) if the sheet is malformed.
bool PlayerSprite_Apply(const uint8 *data, size_t len, bool push_live);

// Put the stock sheet back and return the player to the shared palette row. No-op when none is applied.
void PlayerSprite_Restore(bool push_live);

// True while a custom sheet is applied.
bool PlayerSprite_HasCustom(void);

// Reload gear palettes so the player's banked colors are rebuilt for the current armor and gloves.
void PlayerSprite_RefreshPalette(void);

// The game loaded a gear palette into the shared sprite row; |src| is the outfit it chose inside
// kPalette_ArmorAndGloves. Mirrors it into the player's private bank when a custom sheet is applied.
void GameHook_PlayerGearPaletteLoaded(const uint16 *src);

// The gloves color was refreshed on its own, without a full gear reload.
void GameHook_PlayerGlovesColorUpdated(void);

// ─── HUD/Pause Override (hud_override.c) ───

// True while kFeatures3_HudOverride permits hiding the native HUD/pause menu. WasmSetHudHidden and
// WasmSetPauseHidden (core/wasm-build/emscripten_api.c) test this before honoring a hide request.
bool HudOverride_Allowed(void);

// Force the native HUD and pause menu fully back on screen. Called the instant kFeatures3_HudOverride
// reads clear on gate word 3 (Vanilla Safe engaging, the enhanced-HUD setting turning off, or a future
// embedder), mirroring PlayerSprite_Restore undoing the sprite override on the same trigger. A safe
// no-op when neither is currently hidden.
// Record whether the host WANTS the native HUD / pause menu hidden. The gate is applied by
// HudOverride_Sync, not at this call, so a request made before the gate word reaches WRAM still takes
// effect once it does.
void HudOverride_SetWantedHudHidden(bool on);
void HudOverride_SetWantedPauseHidden(bool on);

// Reconcile both hide masks against the gate and the wanted values. Runs every frame after
// SyncGateWords/SyncCheatWram, and on any change to either input.
void HudOverride_Sync(void);

void HudOverride_Restore(void);

// ─── Dark-room lighting cheat (cheat_lighting.c) ───

// Re-assert (or take back down) the lamp cone in a dark room the player has no lamp for. Runs every
// frame after SyncGateWords/SyncCheatWram, and is a no-op unless the cheat is armed or a cone it
// raised is still standing.
void CheatLighting_Sync(void);

// ─── Receive counters (receive_counters.c) ───

// Tally an item grant against its call site, so a check granted twice is visible instead of inferred.
void SimCountReceive(uint8 site, uint8 item_id);

// ─── Gated empty region (gated_empty.c) ───

// The buffer a refused query returns when the real one is a live-WRAM alias that must not be blanked.
void *GatedEmpty(void);

// ─── Haptic Events (haptic_events.c) ───

// Called when the player starts a sword swing animation.
// swing_type: 0 = normal full swing, 1 = rapid re-swing (quick slash)
void GameHook_NotifySwordSwing(int swing_type);

// Called when the player's sword connects with an enemy sprite.
void GameHook_NotifySwordHitEnemy(uint8 damage_dealt);

// Called when the player's sword clinks against an invulnerable surface/enemy.
void GameHook_NotifySwordClink(void);

// Called when the player takes damage (damage_amount = hearts lost in 1/8ths).
void GameHook_NotifyDamageTaken(uint8 damage_amount);

// Called when the player uses a Y-button item.
void GameHook_NotifyItemUsed(uint8 item_id);

// Called for environmental haptic events (falling, landing, chest open, etc.)
// event_type: 0=fall_into_pit, 1=land_from_ledge, 2=chest_open, 3=bomb_explode,
//             4=enter_water, 5=mirror_warp, 6=quake, 7=boss_defeated
void GameHook_NotifyEnvironmentalEvent(uint8 event_type);

// Called when hookshot hits a wall and retracts.
void GameHook_NotifyHookshotWall(void);

// Called when boomerang returns to the player (catch).
void GameHook_NotifyBoomerangCatch(void);

// ─── Attr Grid State Snapshot (attr_grid_state.c) ───

// Save the WRAM scratch span WasmBuildOverworldAttrGrid's vendored decode step writes through,
// before running the decode.
void AttrGridState_Snapshot(void);

// Put that scratch span back exactly as it was. Called on every return path out of
// WasmBuildOverworldAttrGrid, including the gated-off one, so the decode is never observable
// from inside a live run.
void AttrGridState_Restore(void);

// ─── Transition Events (transition_events.c) ───

// Called once per game frame from Module_MainRouting, after the frame's module has run.
// Gated on kFeatures0_DeveloperTools: makes zero host-calls when that setting is off.
void GameHook_ModuleFrameEnd(void);

// Captures the completed OAM for one frame into a diagnostic ring; no-op without developer tools.
void GameHook_CaptureOamFrame(void);

// ─── Running Man Widescreen Overrun (running_man.c) ───

// Called every frame right after RunningMan_Draw, before Sprite_ReturnIfInactive gates the rest of
// the function. No-op unless a wide/tall view is active and he's actively fleeing; otherwise clears
// the screen-relative active window's per-frame pause and immunizes him against its auto-kill, so a
// stationary player doesn't leave him frozen mid-view well short of the fence/forest.
void GameHook_RunningManStayActive(int k);

// Called at the point the scripted right-side leg sequence (right, down, right) would normally
// hand him back to idle. Vanilla's script is a fixed handful of frames tuned to end past a 256px
// screen, which falls well short of a wide view. Returns false (vanilla ends the flee, unchanged)
// unless a wide/tall view is active; when it returns true, the caller must skip that transition,
// because this call has already re-armed him to keep running the same direction.
bool GameHook_RunningManExtendRun(int k);

// Called each frame Sprite_RunningMan is in a run leg. No-op unless a wide/tall view is active
// (Wide_Active()); otherwise accelerates his fixed vanilla velocity over time and ends the flee
// (back to idle, in place) at a world-distance cap or the moment he collides with solid geometry,
// so a wide view never shows him stuck against the fence/forest bounding the Kakariko race track.
void GameHook_RunningManOverrun(int k, bool running);
// ─── Music (music_hooks.c) ───

// Called on every write the game makes to the SPC music-control port. Reports the raw control byte
// plus the location context a host player needs to resolve which music it actually means (the module,
// the entrance, and the overworld area). Gated on kHostGate_ExternalMusic: zero host-calls when off.
void GameHook_MusicCtrl(uint8 music_ctrl);

// True while the host owns music playback, so the core keeps its own music channel silent.
bool GameHook_MusicExternal(void);

// Re-announces the current track so the sound chip resumes its own music. Call BEFORE clearing
// the external-music gate: the control port is held paused while the host plays, and nothing
// else would write it again until the music happened to change.
void GameHook_MusicRestore(void);

// Re-reports the track and the ambient bed the game is currently playing, for a host that attached
// after they were selected. Silences the chip's own copies on the way. Gated the same as MusicCtrl.
void GameHook_MusicAnnounce(void);

// Which entrances an extended pack gives a track of their own, as 5 words of 32 bits (133 entrances).
void GameHook_SetDeluxeEntrances(int index, uint32 bits);

// Re-raises the ambient bed a restored snapshot was playing and, when the host claims it, silences
// the chip's own resumed copy, which would otherwise sound together with the host's. Call with the APU locked.
void GameHook_AmbientAfterLoad(uint8 last_ambient);

// Marks the ambient clear the hook layer is about to raise as OURS, so the report below skips it.
//
// The clear id does two unrelated jobs. The game raises it to mean "the bed ends here", which the
// host has to hear. The hook layer raises the SAME id to silence the chip's copy of a bed it just
// handed to the host. If the host heard that one it would stop the bed it was just given, which
// is precisely how a state load came to restore its music and its thunder but no rain. One flag,
// consumed by the next report, keeps the two apart.
void GameHook_MarkSelfRaisedAmbientClear(void);

// Whether |track|, after the host's remapping, is the music already playing: 1/0, or -1 when the
// host cannot say and the caller should use the vanilla compare.
int GameHook_MusicIsPlayingRemapped(uint8 track);

// The music byte a death/save-quit respawn should queue, given the starting-point table's own
// |vanilla| byte. Resolves the spawn room to its entrance so the remap that follows is keyed to
// the right interior and not to the door used before dying. Identity unless external music.
uint8 GameHook_StartingPointMusic(int starting_point, uint8 vanilla);

// The music byte the game should use for |entrance|, given the table's own |vanilla| byte. Hands back
// a real indoor song in place of a duck or an overworld song when the host's pack has a track for
// that entrance, so the host's remap can reach it. Identity unless external music is on.
uint8 GameHook_EntranceMusic(int entrance, uint8 vanilla);

// ─── Sound (sound_hooks.c) ───

// The three sound-effect ports the audio NMI writes, in the order it writes them. Ambient (APUI01)
// carries the looping environment sound; the two sfx channels (APUI02/APUI03) carry one-shots and the
// game picks whichever is free. An id means a different sound per channel, so a claim is per channel.
enum {
  kSoundChannel_Ambient = 0,
  kSoundChannel_Sfx1 = 1,
  kSoundChannel_Sfx2 = 2,
  kSoundChannel_Count = 3,
};

// Record which of the 64 sound ids the host can play on |channel|, as a bitmask pair (ids 0-31 in
// |low|, 32-63 in |high|). Out-of-range channels are ignored.
void GameHook_SetSoundClaim(int channel, uint32 low, uint32 high);

// Report one sound the game wants played, and answer whether the host took it. True means the host
// has claimed this id, and that is also the signal NOT to write the port, so the chip stays silent for
// it. Gated on kHostGate_ExternalAmbient / kHostGate_ExternalSfx: zero host-calls when off.
bool GameHook_Sound(int channel, uint8 raw);

// Whether the host claims |id| on |channel|. The predicate alone, with no report and no gate check.
bool GameHook_SoundClaimed(int channel, uint8 id);

// Diagnostics only: report one raise to the host's sound trace, gated on kHostGate_SoundTrace.
// Never changes what plays. GameHook_Sound calls it for every raise it sees; the after-load bed
// report calls it itself because it never goes through GameHook_Sound.
void GameHook_TraceSound(int channel, uint8 id, uint8 pan, bool claimed);

#endif // GAME_HOOKS_H
