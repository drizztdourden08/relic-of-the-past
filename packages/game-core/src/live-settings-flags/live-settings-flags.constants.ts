/* @layer bridge-wasm @kind constants */
import type { GameSettings } from '@rotp/features';
import type { SessionGate } from '../session-gate-flags';

const FEATURE_FLAGS = {
  extendScreen64:         1,
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
  dimFlashes:             65536,
  disableTelepathy:       131072,
  cameraLockToViewport:   262144,
  perGroupVolume:         524288,
  haptics:                1048576,
  pauseOffscreenEnemies:  2097152,
  extendedRendering:      4194304,
  linearWorldTilemap:     8388608,
  ultrawide:              16777216,
  tallRender:             33554432,
  smoothTransitions:      67108864,
  secondaryItemSlots:     268435456,
  autoSkipDialog:         536870912,
  developerTools:         1073741824,
  prefillFileName:        2147483648,
} as const;

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
  dialogControls:        2147483648,
} as const;

const CHEAT_PERMISSION_BITS =
  FEATURE_FLAGS_3.cheatsEnabled |
  FEATURE_FLAGS_3.cheatIgnoreCollision |
  FEATURE_FLAGS_3.cheatItemGrant |
  FEATURE_FLAGS_3.cheatStats |
  FEATURE_FLAGS_3.cheatCombat;

const PARITY_SESSION_GATES = [
  'itemOverrides', 'npcOverrides', 'dropOverrides', 'standingOverrides', 'scriptedGrants',
  'shopOverrides', 'pondPlan', 'capacityProfile', 'prizeShuffle', 'gearArt',
  'dungeonItemGrants', 'retroBow',
] as const satisfies readonly (SessionGate & keyof typeof FEATURE_FLAGS_3)[];

const NATIVE_MESSAGE_SESSION_GATES = [
  'itemOverrides', 'npcOverrides', 'dropOverrides', 'standingOverrides', 'scriptedGrants',
  'shopOverrides', 'pondPlan',
] as const satisfies readonly SessionGate[];

const UNREGISTERED_QUALITY_OF_LIFE_KEYS = [
  'turnWhileDashing', 'mirrorToDarkworld', 'collectItemsWithSword', 'breakPotsWithSword',
  'disableLowHealthBeep', 'skipIntroOnKeypress', 'showMaxItemsInYellow', 'moreActiveBombs',
  'carryMoreRupees', 'miscBugFixes', 'gameChangingBugFixes', 'cancelBirdTravel', 'dimFlashes',
  'disableTelepathy',
] as const satisfies readonly (keyof GameSettings & keyof typeof FEATURE_FLAGS)[];

export {
  CHEAT_PERMISSION_BITS,
  FEATURE_FLAGS,
  FEATURE_FLAGS_3,
  NATIVE_MESSAGE_SESSION_GATES,
  PARITY_SESSION_GATES,
  UNREGISTERED_QUALITY_OF_LIFE_KEYS,
};
