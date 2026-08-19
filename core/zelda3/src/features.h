// This file declares extensions to the base game
#ifndef ZELDA3_FEATURES_H_
#define ZELDA3_FEATURES_H_

#include "types.h"

// Special RAM locations that are unused but I use for compat things.
enum {
  kRam_APUI00 = 0x648,
  kRam_CrystalRotateCounter = 0x649,
  kRam_BugsFixed = 0x64a,
  kRam_Features0 = 0x64c,
  // Gates overflow features0 (>32 bits), so they continue in further recorded WRAM words taken from the
  // free 0x659-0x66f gap (msu/hud end at 0x658, next named var is 0x670). Recorded for determinism.
  kRam_Features1 = 0x65c,
  kRam_Features2 = 0x660,
  // Segment 2 — 96 more gate bits filling the tail of the same free gap (0x664-0x66f). Verified unused:
  // no symbol here in variables.h or the disassembly name map (the next named vanilla variable is
  // spotlight_var3 at 0x670), no code reads or writes the range, and it reads back all-zero in every
  // recorded gameplay snapshot even though 0x670 does not. Recorded for determinism like the others.
  kRam_Features3 = 0x664,
  kRam_Features4 = 0x668,
  kRam_Features5 = 0x66c,
};

// Every gate bit lives in one of these recorded WRAM words. The count and the address of each index are
// FROZEN: a save state serializes raw WRAM and a replay patches these exact byte offsets, so moving a
// word (or a bit between words) silently invalidates every existing state and replay log.
enum {
  kGateWordCount = 6,
};

enum {
  // Poly rendered uses correct speed
  kBugFix_PolyRenderer = 1,
  kBugFix_AncillaOverwrites = 1,
  kBugFix_Latest = 1,
};

// Enum values for kRam_Features0
enum {
  kFeatures0_ExtendScreen64 = 1,
  kFeatures0_SwitchLR = 2,
  kFeatures0_TurnWhileDashing = 4,
  kFeatures0_MirrorToDarkworld = 8,
  kFeatures0_CollectItemsWithSword = 16,
  kFeatures0_BreakPotsWithSword = 32,
  kFeatures0_DisableLowHealthBeep = 64,
  kFeatures0_SkipIntroOnKeypress = 128,
  kFeatures0_ShowMaxItemsInYellow = 256,
  kFeatures0_MoreActiveBombs = 512,

  // This is set for visual fixes that don't affect game behavior but will affect ram compare.
  kFeatures0_WidescreenVisualFixes = 1024,

  kFeatures0_CarryMoreRupees = 2048,

  kFeatures0_MiscBugFixes = 4096,

  kFeatures0_CancelBirdTravel = 8192,

  kFeatures0_GameChangingBugFixes = 16384,

  kFeatures0_SwitchLRLimit = 32768,

  kFeatures0_DimFlashes = 65536,

  kFeatures0_DisableTelepathy = 131072,

  // Lock the overworld camera to the rendered (wide/tall) view so its edges stop at the area boundary
  // instead of the original 224x256 view — removes the out-of-area black band; Link still walks to the
  // screen edge. Behind a setting because it shifts the camera, which can affect glitch/speedrun timing.
  kFeatures0_CameraLockToViewport = 262144,

  // --- Relic settings contract (W0): opt-in gates so "all off == vanilla". See plans/zelda3-settings-plan.md.
  kFeatures0_PerGroupVolume = 524288,    // independent music/SFX sub-volume; off = stock DSP mix (bit-exact)
  kFeatures0_Haptics = 1048576,          // controller/device vibration events; off = zero GameHook host-calls
  kFeatures0_PauseOffscreenAI = 2097152, // pause sprite AI in the wide/tall extra band; off = stock (sprite would not be loaded off the 256px screen)

  // --- Rendering realignment (plans/settings-registry-map.md): the extended-render dependency tree, each
  //     a real C gate so "all off == vanilla" is enforced in the core, not just by zeroed budgets.
  kFeatures0_ExtendedRendering = 4194304,  // master kill-switch; off => core ignores all extended geometry/behavior (budgets clamp to 0)
  kFeatures0_LinearWorldTilemap = 8388608, // off => BG2 keeps the stock wrapping 512px fetch (no world tilemap)
  kFeatures0_Ultrawide = 16777216,         // off => horizontal budget clamps to the <=19:9 range
  kFeatures0_TallRender = 33554432,        // off => vertical budget clamps to 0 (no taller-than-4:3 view)
  kFeatures0_SmoothTransitions = 67108864, // off => no 2-area transition tilemap (stock wrapped-edge seam)

  // Split out of kFeatures0_SwitchLR (which bundled L/R cycling + these two). Each is its own opt-in now.
  kFeatures0_InventoryReorder = 134217728,  // Y + arrows in the inventory reorders items (off = stock)
  kFeatures0_SecondaryItemSlots = 268435456, // assign separate items to X/L/R buttons (off = Y-only, vanilla)
  // (native-HUD-hide is driven by g_hud_hide_mask / WasmSetHudHidden — not a features0 bit.)

  // Render dialog text instantly and auto-advance message-box waits (mid-message continues, timed
  // pauses, end-of-message dismiss); choice prompts stay interactive. Off = stock text pacing.
  kFeatures0_AutoSkipDialog = 536870912,

  // Master gate for developer-only instrumentation hooks (transition-settled events, and any future
  // dev-only GameHook). Off = zero GameHook host-calls, same contract as kFeatures0_Haptics. Purely
  // observational; never changes gameplay, so it carries no vanilla-parity note.
  kFeatures0_DeveloperTools = 1073741824,
};

// The 42 split bug-fix toggles (kFeatures1_* / kFeatures2_*) — generated from the Wave-1b catalog.
#include "features_bugfixes.h"

// Enum values for kRam_Features3 — cheats and other C-side hook divergences. Unlike kFeatures0 (opt-in
// rendering/QoL settings, each independent), every kFeatures3_Cheat* bit here ALSO requires
// kFeatures3_CheatsEnabled — see CheatGate() in core/game-hooks/game_hooks_internal.h, the single helper
// every cheat call site tests instead of re-deriving "cheats are on" itself.
enum {
  kFeatures3_CheatsEnabled         = 1,  // master gate for every kFeatures3_Cheat* bit below
  kFeatures3_CheatIgnoreCollision  = 2,
  kFeatures3_CheatItemGrant        = 4,   // give-item + trigger-check family, incl. WasmCanReceiveItem
  kFeatures3_CheatStats            = 8,   // health/rupees/bombs/arrows/magic/bottles
  kFeatures3_CheatCombat           = 16,  // kill-enemies, damage mult, extra armor
  kFeatures3_VanillaSafe           = 32,  // Vanilla Safe: forces every parity-affecting gate bit off (see
                                           // kGateWordParityMask in zelda_rtl.c's SyncGateWords)

  // Independent hook-divergence gates below — no CheatsEnabled dependency, each stands alone.
  kFeatures3_ItemOverrides         = 64,  // randomizer chest-item substitution table
  kFeatures3_TrackerNotifications  = 128, // __onItemReceived host-call on every item receipt
  kFeatures3_PlayerSpriteOverride  = 256, // custom ZSPR player sheet + private palette bank
  kFeatures3_HudOverride           = 512, // native HUD/pause hiding — see HudOverride_Allowed/Restore

  // Host-data gates. These cover exports that feed a HOST system (tracker, renderer, overlay UI,
  // delivery queue) rather than the game itself. They are not cheats and change nothing the game
  // computes, but each one is still a host feature reading emulated state, so it answers to a switch
  // like everything else instead of being implicitly always-on.
  kFeatures3_TrackerQueries        = 1024, // inventory/flag polling that drives the checks tracker
  kFeatures3_NavigationQueries     = 2048, // room, door, grid, sprite and table reads for navigation
  kFeatures3_RenderQueries         = 4096, // viewport/player-state reads the renderer needs
  kFeatures3_OverlayQueries        = 8192, // overlay-UI mode get/set
  kFeatures3_DeliveryQueries       = 16384, // delivery-queue readiness probe
};

#define enhanced_features0 (*(uint32*)(g_ram+0x64c))
#define enhanced_features1 (*(uint32*)(g_ram+0x65c))
#define enhanced_features2 (*(uint32*)(g_ram+0x660))
#define enhanced_features3 (*(uint32*)(g_ram+0x664))
#define enhanced_features4 (*(uint32*)(g_ram+0x668))
#define enhanced_features5 (*(uint32*)(g_ram+0x66c))
#define msu_curr_sample (*(uint32*)(g_ram+0x650))
#define msu_volume (*(uint8*)(g_ram+0x654))
#define msu_track (*(uint8*)(g_ram+0x655))
#define hud_inventory_order ((uint8*)(g_ram + 0x225)) // 4x6 bytes
#define hud_cur_item_x (*(uint8*)(g_ram+0x656))
#define hud_cur_item_l (*(uint8*)(g_ram+0x657))
#define hud_cur_item_r (*(uint8*)(g_ram+0x658))



// The values the sync loop in zelda_rtl.c pushes into the WRAM gate words each frame, indexed the same
// way as kGateWordCount. The three legacy names alias slots 0-2 so every existing call site keeps
// compiling and writing to exactly the same storage.
extern uint32 g_wanted_gate_words[kGateWordCount];
#define g_wanted_zelda_features (g_wanted_gate_words[0])
#define g_wanted_zelda_features1 (g_wanted_gate_words[1])
#define g_wanted_zelda_features2 (g_wanted_gate_words[2])

// The gate word actually landed in WRAM this frame for |index| — i.e. after SyncGateWords applies the
// Vanilla Safe mask — unlike g_wanted_gate_words[index], which is whatever was last requested and may
// not survive it. Defined in zelda_rtl.c alongside kGateWordRamAddr/SyncGateWords. Reads 0 before the
// very first SyncGateWords() call, since WRAM starts zeroed and nothing has synced into it yet — the
// honest answer for "what is in effect" before any frame has run.
uint32 ZeldaGetEffectiveGateWord(int index);

#endif  // ZELDA3_FEATURES_H_
