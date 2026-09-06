/* @layer bridge-wasm @kind logic */
/** Feature-word builders for live WASM settings. Values must match features.h (the PPU
 * render flags live in live-settings-ppu-flags.ts). */
import type { GameSettings } from '@shared/types/settings';
import { BUNDLE_FIXES } from '@shared/features/bundle-fixes.generated';
import { effectiveFeatureIds } from './live-settings-gate';
import { offscreenAiMode } from './settings';
import { sessionGateArmed, setSessionGate } from './session-gate-flags';

// Feature flag enum values: must match features.h
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
// queries (sprite/combat tables etc.). It is the game's own data, not a gameplay change, so the
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

// Word 3 (features3) bit values. Must match kRam_Features3 in features.h. The four category bits
// (CheatIgnoreCollision/CheatItemGrant/CheatStats/CheatCombat) are PERMISSIONS: each one just lets its
// cheat family run at all. The actual per-cheat on/off lives elsewhere (e.g. ignore-collision's real
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
  receiptExport:         32768,
  receiptMessages:       65536,
  npcOverrides:          131072,
  dropOverrides:         262144,
  standingOverrides:     524288,
  scriptedGrants:        1048576,
  capacityProfile:       2097152,
  coloredRupees:         4194304,
  itemSheen:             8388608,
  prizeShuffle:          16777216,
  shopOverrides:         33554432,
  pondPlan:              67108864,
  gearArt:               134217728,
  dungeonItemGrants:     268435456,
  retroBow:              536870912,
  archeryNeedsBow:       1073741824,
} as const;

// Whether the randomizer's chest-override table currently has entries. randomizer.ts flips this
// (and re-pushes word 3) around WasmSetChestSlotOverride/WasmClearItemOverrides, so the gate is only
// ever open while there is something in the table to apply. A stale table from an earlier session
// can never silently start substituting items again just because some unrelated setting changed
// (see the "leftover override table" note in core/game-hooks/item_overrides.c). There is no user
// setting for this yet: the randomizer client itself is still unwired (see randomizer.ts), so the
// bit has no other honest driver until that lands.
const setItemOverridesActive = (on: boolean): void => setSessionGate('itemOverrides', on);

// Whether the randomizer's scripted-grant (npc) substitution table has entries. Same
// contract as sessionGateArmed('itemOverrides') above: npc-grant-overrides.ts flips this (and re-pushes
// word 3) around WasmSetNpcGrantOverride/WasmClearNpcGrantOverrides, so the gate is only
// ever open while there is something in the table to apply.
const setNpcOverridesActive = (on: boolean): void => setSessionGate('npcOverrides', on);

// Whether the randomizer's key-drop substitution table has entries. Same contract as
// the two flags above: drop-overrides.ts flips this (and re-pushes word 3) around
// WasmSetDropOverride/WasmClearDropOverrides.
const setDropOverridesActive = (on: boolean): void => setSessionGate('dropOverrides', on);

// Whether the randomizer's standing-prize substitution table has entries. Same
// contract again: standing-overrides.ts flips this (and re-pushes word 3) around
// WasmSetStandingOverride/WasmClearStandingOverrides.
const setStandingOverridesActive = (on: boolean): void => setSessionGate('standingOverrides', on);

// Whether the randomizer's scripted-grant substitution slots (the upgrade pond, the
// cave bat, the prize minigame: core/game-hooks/scripted_grants.c) are armed. Same
// contract as the other override flags: scripted-grant-overrides.ts flips this (and
// re-pushes word 3) around the WasmSet*/WasmClearScriptedGrantOverrides calls.
const setScriptedGrantsActive = (on: boolean): void => setSessionGate('scriptedGrants', on);

// Whether the randomizer's shelf-slot substitution table has entries. Same contract as
// the other override tables: shop-overrides.ts flips this (and re-pushes word 3) around
// WasmSetShopSlotOverride/WasmClearShopSlotOverrides.
const setShopOverridesActive = (on: boolean): void => setSessionGate('shopOverrides', on);

// Whether a randomizer capacity profile (starting tiers, tier caps, the wallet ladder:
// core/game-hooks/capacity_profile.c) is armed. Same contract as the override flags:
// capacity-profile.ts flips this (and re-pushes word 3) around the WasmSetCapacityProfile /
// WasmClearCapacityProfile calls, so the gate is only open while a profile is armed.
const setCapacityProfileActive = (on: boolean): void => setSessionGate('capacityProfile', on);

// Whether the placement shuffles the dungeon prizes (core/game-hooks/prize_grants.c).
// Same contract as the override flags: the session flips this (and re-pushes word 3) when
// it arms a placement whose prize slots are shuffled, so the boss rooms only consult the
// hook-owned "reward claimed" bit while such a placement is live.
const setPrizeShuffleActive = (on: boolean): void => setSessionGate('prizeShuffle', on);

// Whether a rupee-pond plan (core/game-hooks/pond_plan.c) is armed. Same contract as
// the override flags: pond-plan.ts flips this (and re-pushes word 3) around the
// WasmSetPondThrow / WasmClearPondPlan calls, so the pond's own handler only consults
// the plan while one is actually loaded.
const setPondPlanActive = (on: boolean): void => setSessionGate('pondPlan', on);

// Whether the receipt flow is in use. Randomizer sessions flip this on at START and off
// at stop (armReceiptGates/disarmReceiptGates in receipt-grants.ts) so a fully native
// chest-override receipt already finds its message gate latched at the first chest;
// delivery-api.ts additionally flips it on when it enqueues a receipt-flow grant, which
// covers grants fired outside a session. The queue paces execution off
// WasmCanReceiveItem, so the gate has latched into WRAM (SyncGateWords, next frame) by
// the time the grant actually fires. The C side still refuses every grant the instant
// Vanilla Safe strips the bit.
const setReceiptGrantsActive = (on: boolean): void => setSessionGate('receiptGrants', on);

// Whether the core holds the extracted gear pictures (core/game-hooks/gear_icon.c). Same
// contract as the override flags: gear-icons.ts flips this (and re-pushes word 3) around
// the WasmApplyGearIconsFile / WasmClearGearIcons calls, so the world draw seams only
// repaint a blade or a shield while a file is actually loaded to repaint it with.
const setGearArtActive = (on: boolean): void => setSessionGate('gearArt', on);

// Whether a randomizer session may hand over another dungeon's key, big key, map or
// compass (core/game-hooks/dungeon_item_grants.c). Armed for the whole life of a session,
// not off the plan alone: an online session receives an assigned item from the
// server at any moment, with no plan row behind it, so the seam that redirects the grant
// has to be open the whole time the session is.
const setDungeonItemGrantsActive = (on: boolean): void => setSessionGate('dungeonItemGrants', on);

// Whether a randomizer session's bow is fed rupees, not arrows
// (core/game-hooks/retro_bow.c). Same contract as the override flags: retro-bow.ts flips
// this (and re-pushes word 3) around the WasmSetRetroBow / WasmClearRetroBow calls, so
// the bow handler's shot branch only leaves its vendored expression while costs are armed.
const setRetroBowActive = (on: boolean): void => setSessionGate('retroBow', on);

const buildFeatureWord3 = (s: GameSettings): number => {
  let flags = 0;
  if (s.vanillaSafe) flags |= FEATURE_FLAGS_3.vanillaSafe;
  // Vanilla Safe forces every cheat off regardless of cheatsEnabled. Cheats are the textbook
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
  // kGateWordParityMask in zelda_rtl.c, which already forces this bit off under Vanilla Safe). Kept
  // honest here too instead of relying on the C mask alone.
  if (sessionGateArmed('itemOverrides') && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.itemOverrides;
  // Scripted-grant substitution is the same class of parity divergence as the chest
  // table: its own bit, forced off by Vanilla Safe here and in the C-side mask.
  if (sessionGateArmed('npcOverrides') && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.npcOverrides;
  // Key-drop substitution: same class again, its own bit, same Vanilla Safe rule.
  if (sessionGateArmed('dropOverrides') && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.dropOverrides;
  // Standing-prize substitution: same class again, its own bit, same Vanilla Safe rule.
  if (sessionGateArmed('standingOverrides') && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.standingOverrides;
  // Scripted-grant substitution (pond/bat/minigame slots): same class again.
  if (sessionGateArmed('scriptedGrants') && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.scriptedGrants;
  // Shelf-slot substitution: same class again, its own bit, same Vanilla Safe rule.
  if (sessionGateArmed('shopOverrides') && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.shopOverrides;
  // The pond's plan (its prices, its throws, the gems it shows): a parity divergence
  // inside the pond's own handler: its own bit, same Vanilla Safe rule.
  if (sessionGateArmed('pondPlan') && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.pondPlan;
  // Capacity profile (new-file tiers, tier caps, the wallet ladder): a parity divergence
  // like the tables above, its own bit, same Vanilla Safe rule, same C-side mask entry.
  if (sessionGateArmed('capacityProfile') && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.capacityProfile;
  // Dungeon prize shuffle: the boss rooms read a hook-owned claimed-bit and the rising
  // crystal banks an assigned crystal, a parity divergence like the tables above, same
  // Vanilla Safe rule, same C-side mask entry.
  if (sessionGateArmed('prizeShuffle') && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.prizeShuffle;
  // Gear art (a substituted blade or shield drawn in its own colours instead of the
  // player's): a parity divergence inside the world draw seams. Its own bit, same
  // Vanilla Safe rule, same C-side mask entry.
  if (sessionGateArmed('gearArt') && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.gearArt;
  // Targeted dungeon-item grants: the receipt writes another dungeon's key count or
  // bitfield bit, a parity divergence like the tables above, same Vanilla Safe rule,
  // same C-side mask entry.
  if (sessionGateArmed('dungeonItemGrants') && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.dungeonItemGrants;
  // Retro bow: a shot is paid for out of the wallet inside the bow handler's own branch,
  // a parity divergence like the tables above, same Vanilla Safe rule, same C-side mask entry.
  if (sessionGateArmed('retroBow') && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.retroBow;
  // TrackerNotifications' own host-call never changes emulated state, but its call site
  // (GameHook_NotifyItemReceived, from Link_ReceiveItem()) is woven into vendored player.c, the same
  // "anything that touches that code is a divergence" rule haptics gets above, so it IS in the C-side
  // parity mask and gets stripped here too instead of relying on the mask alone. The tracker's item
  // log and the simulator's onItemReceived observation both depend on it and neither has (or needs) a
  // setting of its own, so it's on whenever Vanilla Safe allows it.
  if (!s.vanillaSafe) flags |= FEATURE_FLAGS_3.trackerNotifications;
  // Custom player sprite follows whether one is actually configured, same as the INI's LinkGraphics
  // key (settings.ts serializeToIni), and is stripped under Vanilla Safe like any other divergence
  // (also enforced by the C-side parity mask).
  if (s.linkSprite && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.playerSpriteOverride;
  // HUD override follows whether the enhanced overlay is actually configured to hide any native part
  // (live-settings.ts computes the identical hideHud/hidePause conditions for WasmSetHudHidden/
  // WasmSetPauseHidden), and is stripped under Vanilla Safe like any other divergence, which is what
  // lets Vanilla Safe restore the native HUD/pause menu mid-session (HudOverride_Restore in
  // core/game-hooks/hud_override.c, called the instant this bit clears in WRAM).
  const hudOverrideWanted = s.hudMode === 'enhanced' && (s.hudEnhancedParts.includes('main') || s.hudEnhancedParts.includes('pause'));
  if (hudOverrideWanted && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.hudOverride;

  // Host-data gates. These feed host systems (tracker, navigation, renderer, overlay UI, delivery
  // queue), not the game, so none of them is a parity concern and none is stripped by Vanilla
  // Safe. They are gated all the same: a host feature reading emulated state answers to a switch, and
  // an export nobody enabled returns nothing.
  if (s.trackerEnabled) flags |= FEATURE_FLAGS_3.trackerQueries;
  // Navigation data is dev-surface data, so it needs BOTH the dev master and its own toggle. The two
  // conditions resolve here instead of at 30-odd call sites.
  if (s.developerToolsEnabled && s.devNavigationData) flags |= FEATURE_FLAGS_3.navigationQueries;
  // Delivery readiness is only meaningful while something can actually deliver an item: a cheat grant,
  // the randomizer's override table, or a receipt-flow delivery. No new setting needed, the condition
  // already exists. (sessionGateArmed('receiptGrants') closes the gap where a pure-deliver session (online, zero
  // chest overrides, cheats off) had no gate driver and the queue's readiness probe answered 0.)
  if ((s.cheatsEnabled && !s.vanillaSafe) || sessionGateArmed('itemOverrides') || sessionGateArmed('receiptGrants')) flags |= FEATURE_FLAGS_3.deliveryQueries;
  // Receipt-flow grants + contextual receipt messages: parity divergences (a grant runs the vendored
  // receipt path, a message substitution rewires the vendored message seam), so both strip under
  // Vanilla Safe. The C-side kGateWordParityMask enforces the same thing un-bypassably.
  if (sessionGateArmed('receiptGrants') && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.receiptExport | FEATURE_FLAGS_3.receiptMessages;
  // Contextual messages also ride on an active override table: chest, npc, drop and
  // standing overrides arm their class message natively in C at grant time, with no
  // delivery ever enqueued.
  if ((sessionGateArmed('itemOverrides') || sessionGateArmed('npcOverrides') || sessionGateArmed('dropOverrides') || sessionGateArmed('standingOverrides')
    || sessionGateArmed('scriptedGrants') || sessionGateArmed('shopOverrides') || sessionGateArmed('pondPlan')) && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.receiptMessages;
  // Renderer and overlay reads have no meaningful "off" yet: the app cannot draw a frame or route its
  // own overlay without them, so inventing a user toggle would only offer a way to break the window.
  // They are declared and gate-checked like the rest so a future embedder (or a headless build) can
  // withhold them, and so the audit can prove they were classified, not forgotten.
  flags |= FEATURE_FLAGS_3.renderQueries | FEATURE_FLAGS_3.overlayQueries;
  // World-item presentation, the two player-facing toggles in this word. Both are registered
  // ids, so they answer to the same Vanilla Safe resolver as the features0 bits below instead
  // of to a hand-written "&& !vanillaSafe". The C-side parity mask covers them too.
  const presentation = effectiveFeatureIds(s);
  if (presentation.has('coloredRupees')) flags |= FEATURE_FLAGS_3.coloredRupees;
  if (presentation.has('itemSheen')) flags |= FEATURE_FLAGS_3.itemSheen;
  // The archery host refusing a fee he cannot honour: a registered id like the two above,
  // so it answers to the same Vanilla Safe resolver and the same C-side parity mask. Its own
  // bit, not retroBow's, because the no-bow half of it is wanted in a plain seed too.
  if (presentation.has('archeryNeedsBow')) flags |= FEATURE_FLAGS_3.archeryNeedsBow;
  return flags;
};

const buildFeatureFlags = (s: GameSettings): number => {
  let flags = 0;
  // Registered ids are gated through the Vanilla Safe resolver (shared/features/resolve-gates.ts) instead
  // of a hand-checked "er && ..." chain: it strips every parity-affecting id when vanillaSafe is on, then
  // the requires-fixpoint cascades that to every dependent, so a chain like extendedRendering →
  // linearWorldTilemap → {ultrawide, tallRender} collapses without this file maintaining the tree.
  const effective = effectiveFeatureIds(s);
  const isOn = (id: string): boolean => effective.has(id);
  // widescreenSprites/widescreenVisualFixes additionally need a wide ratio. That condition
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
  // Off-screen behaviour is three-way now, so the pause bit answers to the mode instead of to a
  // boolean: 'idle' carries its own features2 bit (buildFeatureWords) and 'acting' sets neither.
  if (isOn('pauseOffscreenAI') && offscreenAiMode(s) === 'paused') flags |= FEATURE_FLAGS.pauseOffscreenAI;
  if (isOn('inventoryReorder')) flags |= FEATURE_FLAGS.inventoryReorder;
  if (isOn('secondaryItemSlots')) flags |= FEATURE_FLAGS.secondaryItemSlots;
  if (autoSkipDialogOverride === null ? isOn('autoSkipDialog') : autoSkipDialogOverride)
    flags |= FEATURE_FLAGS.autoSkipDialog;
  // Not yet registered as FeatureDefs (the 16 snesrev quality-of-life flags: see feature-registry.ts),
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
  // affectsVanillaParity: true), so Vanilla Safe forces it off same as any other divergence. The
  // un-bypassable C-side mask (zelda_rtl.c kGateWordParityMask) already covers this regardless, but
  // gating the live push too keeps this file's "wanted" bits honest about what is actually allowed.
  // developerTools stays host-only and unconditional. It DOES reach vendored code. Its
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
  // aspectRatio, not on another feature id.
  const wide = effective.has('extendedRendering') && s.aspectRatio !== '4:3';
  if (wide) {
    if (effective.has('widescreenPlayArea')) f2 |= FEATURES2_FLAGS.widescreenPlayArea;
    if (effective.has('offscreenAI') && offscreenAiMode(s) === 'idle') f2 |= FEATURES2_FLAGS.widescreenIdleAI;
  }
  return { features1: f1, features2: f2 };
};

// The PPU builder keeps its historical import path for existing callers.
export { buildPpuFlags } from './live-settings-ppu-flags';
export { buildFeatureFlags, buildFeatureWord3, buildFeatureWords, setAutoSkipDialogOverride, setCapacityProfileActive, setDeveloperToolsOverride, setDropOverridesActive, setDungeonItemGrantsActive, setGearArtActive, setItemOverridesActive, setNpcOverridesActive, setPondPlanActive, setPrizeShuffleActive, setReceiptGrantsActive, setRetroBowActive, setScriptedGrantsActive, setShopOverridesActive, setStandingOverridesActive };
