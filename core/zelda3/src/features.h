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
  // Split bug-fix toggles overflow features0 (>32 bits), so they live in two more recorded WRAM words in
  // the free 0x659-0x66f gap (msu/hud end at 0x658, next named var is 0x670). Recorded for determinism.
  kRam_Features1 = 0x65c,
  kRam_Features2 = 0x660,
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

#define enhanced_features0 (*(uint32*)(g_ram+0x64c))
#define enhanced_features1 (*(uint32*)(g_ram+0x65c))
#define enhanced_features2 (*(uint32*)(g_ram+0x660))
#define msu_curr_sample (*(uint32*)(g_ram+0x650))
#define msu_volume (*(uint8*)(g_ram+0x654))
#define msu_track (*(uint8*)(g_ram+0x655))
#define hud_inventory_order ((uint8*)(g_ram + 0x225)) // 4x6 bytes
#define hud_cur_item_x (*(uint8*)(g_ram+0x656))
#define hud_cur_item_l (*(uint8*)(g_ram+0x657))
#define hud_cur_item_r (*(uint8*)(g_ram+0x658))



extern uint32 g_wanted_zelda_features;
extern uint32 g_wanted_zelda_features1;
extern uint32 g_wanted_zelda_features2;


#endif  // ZELDA3_FEATURES_H_
