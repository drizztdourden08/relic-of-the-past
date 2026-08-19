/* @layer bridge-wasm @kind logic */
/** Bitflag builders for live WASM settings — values must match features.h / ppu.h. */
import type { GameSettings } from '@shared/types/settings';
import { BUNDLE_FIXES } from '@shared/features/bundle-fixes.generated';
import { effectiveFeatureIds } from './live-settings-gate';
import { offscreenAiMode } from './settings';

// Feature flag enum values — must match features.h
const FEATURE_FLAGS = {
  extendScreen64:         1,
  switchLR:               2,
  turnWhileDashing:       4,
  mirrorToDarkworld:      8,
  collectItemsWithSword:  16,
  breakPotsWithSword:     32,
  disableLowHealthBeep:   64,
  skipIntroOnKeypress:    128,
  showMaxItemsInYellow:   256,
  moreActiveBombs:        512,
  widescreenVisualFixes:  1024,
  carryMoreRupees:        2048,
  miscBugFixes:           4096,
  cancelBirdTravel:       8192,
  gameChangingBugFixes:   16384,
  switchLRLimit:          32768,
  dimFlashes:             65536,
  disableTelepathy:       131072,
  cameraLockToViewport:   262144,
  perGroupVolume:         524288,
  haptics:                1048576,
  pauseOffscreenAI:       2097152,
  extendedRendering:      4194304,
  linearWorldTilemap:     8388608,
  ultrawide:              16777216,
  tallRender:             33554432,
  smoothTransitions:      67108864,
  inventoryReorder:       134217728,
  secondaryItemSlots:     268435456,
  autoSkipDialog:         536870912,
  developerTools:         1073741824,
} as const;

// When non-null, forces the auto-skip-dialog bit to this value in the pushed features word regardless of
// the user's setting; null defers to the setting. Used by the gameplay simulator during its runs.
let autoSkipDialogOverride: boolean | null = null;

const setAutoSkipDialogOverride = (on: boolean | null): void => {
  autoSkipDialogOverride = on;
};

// When non-null, ORs the developer-tools bit into the pushed features word regardless of the user's
// setting; null defers to the setting. The developer-tools gate only unlocks read-only instrumentation
// queries (sprite/combat tables etc.) — it is the game's own data, not a gameplay change — so the
// simulator, itself a developer tool, may switch it on for the duration of a headless run.
let developerToolsOverride: boolean | null = null;

const setDeveloperToolsOverride = (on: boolean | null): void => {
  developerToolsOverride = on;
};

// Hand-authored features2 bits, allocated downward from bit 24; the generated bug-fix catalog
// (BUNDLE_FIXES) owns features2 upward from bit 0. Values must match features.h.
const FEATURES2_FLAGS = {
  widescreenPlayArea: 16777216, // kFeatures2_WidescreenPlayArea = 1 << 24
  widescreenIdleAI: 33554432, // kFeatures2_WidescreenIdleAI = 1 << 25
} as const;

// Word 3 (features3) bit values — must match kRam_Features3 in features.h. The four category bits
// (CheatIgnoreCollision/CheatItemGrant/CheatStats/CheatCombat) are PERMISSIONS: each one just lets its
// cheat family run at all — the actual per-cheat on/off lives elsewhere (e.g. ignore-collision's real
// state is the WRAM byte at 0x37F, set by its own WasmCheat* export), so granting all four alongside the
// master is safe and is the only way any cheat can ever activate.
const FEATURE_FLAGS_3 = {
  cheatsEnabled:         1,
  cheatIgnoreCollision:  2,
  cheatItemGrant:        4,
  cheatStats:            8,
  cheatCombat:           16,
  vanillaSafe:           32,
  itemOverrides:         64,
  trackerNotifications:  128,
  playerSpriteOverride:  256,
  hudOverride:           512,
  trackerQueries:        1024,
  navigationQueries:     2048,
  renderQueries:         4096,
  overlayQueries:        8192,
  deliveryQueries:       16384,
} as const;

// Whether the randomizer's chest-override table currently has entries. randomizer.ts flips this
// (and re-pushes word 3) around WasmSetItemOverride/WasmClearItemOverrides, so the gate is only
// ever open while there is something in the table to apply — a stale table from an earlier session
// can never silently start substituting items again just because some unrelated setting changed
// (see the "leftover override table" note in core/game-hooks/item_overrides.c). There is no user
// setting for this yet — the randomizer client itself is still unwired (see randomizer.ts) — so the
// bit has no other honest driver until that lands.
let itemOverridesActive = false;

const setItemOverridesActive = (on: boolean): void => {
  itemOverridesActive = on;
};

const buildFeatureWord3 = (s: GameSettings): number => {
  let flags = 0;
  if (s.vanillaSafe) flags |= FEATURE_FLAGS_3.vanillaSafe;
  // Vanilla Safe forces every cheat off regardless of cheatsEnabled — cheats are the textbook
  // divergence from stock behavior, so they get no exemption.
  if (s.cheatsEnabled && !s.vanillaSafe) {
    flags |=
      FEATURE_FLAGS_3.cheatsEnabled |
      FEATURE_FLAGS_3.cheatIgnoreCollision |
      FEATURE_FLAGS_3.cheatItemGrant |
      FEATURE_FLAGS_3.cheatStats |
      FEATURE_FLAGS_3.cheatCombat;
  }
  // Randomizer chest-item substitution is a parity-affecting divergence (see the C-side
  // kGateWordParityMask in zelda_rtl.c, which already forces this bit off under Vanilla Safe) — kept
  // honest here too rather than relying on the C mask alone.
  if (itemOverridesActive && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.itemOverrides;
  // TrackerNotifications' own host-call never changes emulated state, but its call site
  // (GameHook_NotifyItemReceived, from Link_ReceiveItem()) is woven into vendored player.c — the same
  // "anything that touches that code is a divergence" rule haptics gets above — so it IS in the C-side
  // parity mask and gets stripped here too rather than relying on the mask alone. The tracker's item
  // log and the simulator's onItemReceived observation both depend on it and neither has (or needs) a
  // setting of its own, so it's on whenever Vanilla Safe allows it.
  if (!s.vanillaSafe) flags |= FEATURE_FLAGS_3.trackerNotifications;
  // Custom player sprite follows whether one is actually configured, same as the INI's LinkGraphics
  // key (settings.ts serializeToIni) — and is stripped under Vanilla Safe like any other divergence
  // (also enforced by the C-side parity mask).
  if (s.linkSprite && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.playerSpriteOverride;
  // HUD override follows whether the enhanced overlay is actually configured to hide any native part
  // (live-settings.ts computes the identical hideHud/hidePause conditions for WasmSetHudHidden/
  // WasmSetPauseHidden) — and is stripped under Vanilla Safe like any other divergence, which is what
  // lets Vanilla Safe restore the native HUD/pause menu mid-session (HudOverride_Restore in
  // core/game-hooks/hud_override.c, called the instant this bit clears in WRAM).
  const hudOverrideWanted = s.hudMode === 'enhanced' && (s.hudEnhancedParts.includes('main') || s.hudEnhancedParts.includes('pause'));
  if (hudOverrideWanted && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.hudOverride;

  // Host-data gates. These feed host systems (tracker, navigation, renderer, overlay UI, delivery
  // queue) rather than the game, so none of them is a parity concern and none is stripped by Vanilla
  // Safe. They are gated all the same: a host feature reading emulated state answers to a switch, and
  // an export nobody enabled returns nothing.
  if (s.trackerEnabled) flags |= FEATURE_FLAGS_3.trackerQueries;
  // Navigation data is dev-surface data, so it needs BOTH the dev master and its own toggle. The two
  // conditions resolve here rather than at 30-odd call sites.
  if (s.developerToolsEnabled && s.devNavigationData) flags |= FEATURE_FLAGS_3.navigationQueries;
  // Delivery readiness is only meaningful while something can actually deliver an item: a cheat grant,
  // or the randomizer's override table. No new setting needed, the condition already exists.
  if ((s.cheatsEnabled && !s.vanillaSafe) || itemOverridesActive) flags |= FEATURE_FLAGS_3.deliveryQueries;
  // Renderer and overlay reads have no meaningful "off" yet: the app cannot draw a frame or route its
  // own overlay without them, so inventing a user toggle would only offer a way to break the window.
  // They are declared and gate-checked like the rest so a future embedder (or a headless build) can
  // withhold them, and so the audit can prove they were classified rather than forgotten.
  flags |= FEATURE_FLAGS_3.renderQueries | FEATURE_FLAGS_3.overlayQueries;
  return flags;
};

// PPU render flag values — must match ppu.h
const PPU_FLAGS = {
  newRenderer:    1,
  mode7_4x4:     2,
  height240:     4,
  noSpriteLimits: 8,
} as const;

const buildFeatureFlags = (s: GameSettings): number => {
  let flags = 0;
  // Registered ids are gated through the Vanilla Safe resolver (shared/features/resolve-gates.ts) instead
  // of a hand-checked "er && …" chain: it strips every parity-affecting id when vanillaSafe is on, then
  // the requires-fixpoint cascades that to every dependent, so a chain like extendedRendering →
  // linearWorldTilemap → {ultrawide, tallRender} collapses without this file maintaining the tree.
  const effective = effectiveFeatureIds(s);
  const isOn = (id: string): boolean => effective.has(id);
  // widescreenSprites/widescreenVisualFixes additionally need a genuinely wide ratio — that condition
  // isn't part of the requires graph (it depends on aspectRatio, not another feature id).
  const wide = isOn('extendedRendering') && s.aspectRatio !== '4:3';
  if (isOn('extendedRendering')) flags |= FEATURE_FLAGS.extendedRendering;
  if (isOn('linearWorldTilemap')) flags |= FEATURE_FLAGS.linearWorldTilemap;
  if (isOn('ultrawideRendering')) flags |= FEATURE_FLAGS.ultrawide;
  if (isOn('tallRendering')) flags |= FEATURE_FLAGS.tallRender;
  if (wide && isOn('widescreenSprites')) flags |= FEATURE_FLAGS.extendScreen64;
  if (wide && isOn('widescreenVisualFixes')) flags |= FEATURE_FLAGS.widescreenVisualFixes;
  if (isOn('cameraLockToViewport')) flags |= FEATURE_FLAGS.cameraLockToViewport;
  if (isOn('smoothTransitions')) flags |= FEATURE_FLAGS.smoothTransitions;
  // Off-screen behaviour is three-way now, so the pause bit answers to the mode rather than to a
  // boolean: 'idle' carries its own features2 bit (buildFeatureWords) and 'acting' sets neither.
  if (isOn('pauseOffscreenAI') && offscreenAiMode(s) === 'paused') flags |= FEATURE_FLAGS.pauseOffscreenAI;
  if (isOn('inventoryReorder')) flags |= FEATURE_FLAGS.inventoryReorder;
  if (isOn('secondaryItemSlots')) flags |= FEATURE_FLAGS.secondaryItemSlots;
  if (autoSkipDialogOverride === null ? isOn('autoSkipDialog') : autoSkipDialogOverride)
    flags |= FEATURE_FLAGS.autoSkipDialog;
  // Not yet registered as FeatureDefs (the 16 snesrev quality-of-life flags — see feature-registry.ts),
  // so the resolver can't reach them; gated inline until that follow-up pass lands. The un-bypassable
  // C-side mask (zelda_rtl.c kGateWordParityMask) already covers every one of these regardless.
  if (!s.vanillaSafe && s.itemSwitchLR) flags |= FEATURE_FLAGS.switchLR;
  if (!s.vanillaSafe && s.itemSwitchLRLimit) flags |= FEATURE_FLAGS.switchLRLimit;
  if (!s.vanillaSafe && s.turnWhileDashing) flags |= FEATURE_FLAGS.turnWhileDashing;
  if (!s.vanillaSafe && s.mirrorToDarkworld) flags |= FEATURE_FLAGS.mirrorToDarkworld;
  if (!s.vanillaSafe && s.collectItemsWithSword) flags |= FEATURE_FLAGS.collectItemsWithSword;
  if (!s.vanillaSafe && s.breakPotsWithSword) flags |= FEATURE_FLAGS.breakPotsWithSword;
  if (!s.vanillaSafe && s.disableLowHealthBeep) flags |= FEATURE_FLAGS.disableLowHealthBeep;
  if (!s.vanillaSafe && s.skipIntroOnKeypress) flags |= FEATURE_FLAGS.skipIntroOnKeypress;
  if (!s.vanillaSafe && s.showMaxItemsInYellow) flags |= FEATURE_FLAGS.showMaxItemsInYellow;
  if (!s.vanillaSafe && s.moreActiveBombs) flags |= FEATURE_FLAGS.moreActiveBombs;
  if (!s.vanillaSafe && s.carryMoreRupees) flags |= FEATURE_FLAGS.carryMoreRupees;
  if (!s.vanillaSafe && s.miscBugFixes) flags |= FEATURE_FLAGS.miscBugFixes;
  if (!s.vanillaSafe && s.gameChangingBugFixes) flags |= FEATURE_FLAGS.gameChangingBugFixes;
  if (!s.vanillaSafe && s.cancelBirdTravel) flags |= FEATURE_FLAGS.cancelBirdTravel;
  if (!s.vanillaSafe && s.dimFlashes) flags |= FEATURE_FLAGS.dimFlashes;
  if (!s.vanillaSafe && s.disableTelepathy) flags |= FEATURE_FLAGS.disableTelepathy;
  // Per-group volume is an explicit opt-in. Off ⇒ the DSP mix stays bit-exact to the original and the
  // Music/SFX sliders are inert; the user must enable it before those sliders take effect.
  if (isOn('perGroupVolume')) flags |= FEATURE_FLAGS.perGroupVolume;
  // Haptics' notify hooks are inserted directly into vendored game code (see feature-registry.ts,
  // affectsVanillaParity: true), so Vanilla Safe forces it off same as any other divergence — the
  // un-bypassable C-side mask (zelda_rtl.c kGateWordParityMask) already covers this regardless, but
  // gating the live push too keeps this file's "wanted" bits honest about what is actually allowed.
  // developerTools stays host-only and unconditional. It DOES reach vendored code — its
  // Both of these only observe, and neither changes what the game computes. Neither is exempt from
  // Vanilla Safe all the same, because the test is whether a feature touches the vendored game code
  // at all: haptics has GameHook_Notify* call sites across ancilla.c/player.c/sprite.c/overworld.c,
  // and developer tools has GameHook_ModuleFrameEnd in misc.c. "Purely observational" was tried as
  // the exemption test and is the reason two features sat wrongly exempt; touching the code is the
  // line, harmless or not. The C-side kGateWordParityMask enforces the same thing where it cannot
  // be bypassed.
  if (!s.vanillaSafe && s.haptics?.enabled) flags |= FEATURE_FLAGS.haptics;
  const devWanted = developerToolsOverride === null ? s.developerToolsEnabled : developerToolsOverride;
  if (devWanted && !s.vanillaSafe)
    flags |= FEATURE_FLAGS.developerTools;
  return flags;
};

// The 42 split bug-fix toggles live in two extra bitmask words (features1/features2). Each fix is on when
// its granular toggle is set, falling back to the legacy bundle setting it was extracted from so existing
// profiles keep their behavior. Values come from the generated registry (must match features_bugfixes.h).
// All 42 are affectsVanillaParity: true, so effectiveFeatureIds already drops every one of them when
// Vanilla Safe is on.
const buildFeatureWords = (s: GameSettings): { features1: number; features2: number } => {
  const effective = effectiveFeatureIds(s);
  let f1 = 0;
  let f2 = 0;
  for (const fix of BUNDLE_FIXES) {
    if (!effective.has(fix.id) || !fix.bit) continue;
    if (fix.word === 2) f2 |= fix.bit;
    else f1 |= fix.bit;
  }
  // Hand-authored features2 bits. Both are registered ids, so they go through the same Vanilla Safe
  // resolver as the generated fixes above; the wide-view condition stays separate because it depends on
  // aspectRatio rather than on another feature id.
  const wide = effective.has('extendedRendering') && s.aspectRatio !== '4:3';
  if (wide) {
    if (effective.has('widescreenPlayArea')) f2 |= FEATURES2_FLAGS.widescreenPlayArea;
    if (effective.has('offscreenAI') && offscreenAiMode(s) === 'idle') f2 |= FEATURES2_FLAGS.widescreenIdleAI;
  }
  return { features1: f1, features2: f2 };
};

// None of these four are registered FeatureDefs yet (they predate the registry and aren't part of the
// 16-flag snesrev QoL follow-up either), so Vanilla Safe can't reach them through effectiveFeatureIds —
// each is hand-gated below instead. newRenderer is the odd one out: per its own settings copy ("a faster,
// rewritten pixel processing unit ... visually identical") it's a pure engine swap with no rendered-pixel
// difference, so it stays on even under Vanilla Safe. The other three visibly change what's on screen
// versus the cartridge (more/taller visible area, no OAM-driven sprite flicker/drop, smoothed Mode 7), so
// they're forced off the same as any other affectsVanillaParity: true feature.
const buildPpuFlags = (s: GameSettings): number => {
  let flags = 0;
  if (s.newRenderer) flags |= PPU_FLAGS.newRenderer;
  if (!s.vanillaSafe && s.enhancedMode7) flags |= PPU_FLAGS.mode7_4x4;
  // extend_y (240 lines) must track the INI serializer, which only emits it when extendedRendering is on
  // (and never under Vanilla Safe — see serializeToIni). The render-buffer height is baked at init from
  // that INI value; setting the live Height240 flag without it would make the draw loop's botBudget
  // disagree with the allocated texture (ppu.c PpuSetExtraSideSpace).
  if (!s.vanillaSafe && s.extendedRendering && s.extendY) flags |= PPU_FLAGS.height240;
  if (!s.vanillaSafe && s.noSpriteLimits) flags |= PPU_FLAGS.noSpriteLimits;
  return flags;
};

export { buildFeatureFlags, buildFeatureWord3, buildPpuFlags, buildFeatureWords, setAutoSkipDialogOverride, setDeveloperToolsOverride, setItemOverridesActive };
