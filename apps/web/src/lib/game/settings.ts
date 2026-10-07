/* @layer bridge-wasm @kind data */

import type { GameSettings, OffscreenAiMode } from '@shared/types/settings';
import { DEFAULT_TURBO_SPEED } from '@shared/display/turbo-speed';
import { ONLINE_NOTICE_DEFAULTS } from '@shared/randomizer/archipelago/online-notice-settings';
import { QUIET_RECEIPT_DEFAULTS } from '@shared/game/quiet-receipts';
import { allowedRatio, ratioToString, rendersExtended } from './ratio-capability';

const DEFAULT_SETTINGS: GameSettings = {
  // General
  autosave: false,
  autoSaveEnabled: false,
  autoSaveIntervalSeconds: 300,
  autoSaveMaxEntries: 5,
  saveOnQuit: true,
  displayPerfInTitle: false,
  disableFrameDelay: false,
  vsync: false,
  syncedRefreshRate: false,
  syncedRefreshRateHz: 0,
  turboEnabled: false,
  turboSpeed: DEFAULT_TURBO_SPEED,

  // Aspect Ratio & Display
  extendedRendering: false,
  aspectRatio: '16:9',
  customAspectW: 0,
  customAspectH: 0,
  extendY: true,
  widescreenSprites: true,
  widescreenVisualFixes: true,
  linearWorldTilemap: false,
  ultrawideRendering: false,
  tallRendering: false,
  cameraLockToViewport: false,
  smoothTransitions: false,
  widescreenPlayArea: false,
  offscreenAI: 'idle',

  // Graphics
  windowScale: 2,
  fullscreen: 0,
  newRenderer: true,
  enhancedMode7: true,
  noSpriteLimits: true,
  linearFiltering: false,
  dimFlashes: false,
  linkSprite: null,
  outputMethod: 'SDL',

  // Window (Electron-managed)
  windowMode: 'default',
  startFullscreen: false,
  viewportConstraint: 'none',
  pixelPerfect: false,

  // Mobile display
  renderIntoNotch: true,

  // Gameplay
  itemSwitchLR: false,
  itemSwitchLRLimit: false,
  inventoryReorder: false,
  secondaryItemSlots: false,
  autoSkipDialog: false,
  prefillFileName: false,
  turnWhileDashing: false,
  allowDiving: false,
  mirrorToDarkworld: false,
  collectItemsWithSword: false,
  breakPotsWithSword: false,
  disableLowHealthBeep: false,
  skipIntroOnKeypress: true,
  disableTelepathy: false,
  showMaxItemsInYellow: false,
  moreActiveBombs: false,
  carryMoreRupees: false,
  miscBugFixes: false,
  gameChangingBugFixes: false,
  cancelBirdTravel: false,

  // Audio
  enableAudio: true,
  masterVolume: 100,
  perGroupVolume: false,
  musicVolume: 100,
  musicMuted: false,
  sfxVolume: 100,
  sfxMuted: false,
  ambientVolume: 100,
  ambientMuted: false,
  audioFreq: 44100,
  audioChannels: 2,
  audioSamples: 2048,
  msuConfigMode: 'auto',
  enableMSU: 'false',
  resumeMSU: true,
  resetMSUAtTitle: true,
  packReplaceAmbient: true,
  packReplaceSfx: true,

  // Post-Processing
  overworldEdgeEffect: true,
  postProcessingShadows: false,
  hideSpaceBeyondWalls: true,

  // World item presentation
  coloredRupees: true,
  itemSheen: false,

  // Minigames
  archeryNeedsBow: false,

  // Dialog pacing: the stock values, so a fresh profile plays text exactly as the game does
  dialogSpeed: 1,
  dialogHoldSpeed: 2,
  dialogHoldToAccelerate: true,
  dialogFillOnB: true,
  dialogTypewriter: true,

  // Dialog box look: the enhanced box is what the app ships with, so a fresh profile gets the
  // chamfered single-line frame over a dark ground with drifting triforces. Vanilla Safe masks
  // the HudOverride bit these all ride on, which is what keeps a stock profile stock.
  dialogBox: 'enhanced',
  dialogButtonPrompts: true,
  dialogFont: 'modern',
  dialogFontScale: 1,
  dialogInkColor: '#ffffff',
  dialogStrokeColor: '#000000',
  dialogStrokeWidth: 1,
  // The app's own accent gold and ok green; snapped to the game's 15-bit colours when pushed.
  hudHighlightPrimary: '#e8a33d',
  hudHighlightSecondary: '#7fb861',
  dialogBoxOpacity: 0.5,
  dialogFloatingGround: true,
  dialogIntroTelepathyGround: false,
  dialogGroundFade: true,
  dialogBoxFit: 'full',
  dialogGroundColor: '#000000',
  dialogBorder: 'single',
  dialogBorderThickness: 'thin',
  dialogBorderColor: '#a6a6a6',
  dialogCorner: 'chamfered',
  dialogCornerMark: 'none',
  dialogCornerMarkAngle: 315,
  dialogTexture: 'triforce-filled',
  dialogTextureColor: '#ffeb00',
  dialogTextureOpacity: 0.25,
  dialogTextureAnimation: 'drift',
  dialogTextureSpeed: 'normal',
  dialogTextureScale: 0.75,
  dialogTextureDensity: 30,
  dialogTextureScatter: 100,

  // HUD
  hudMode: 'original',
  hudStyle: 'vanilla',
  hudRatio: 'match',
  customHudAspectW: 0,
  customHudAspectH: 0,
  hudEnhancedParts: ['main', 'pause'],
  hudHeartMode: 'original',
  hudMagicMode: 'original',
  hudCountLayout: 'centered',
  hudCountdownStyle: 'pixel',
  hudPauseStyle: 'vanilla',
  hudPauseHighlight: 'box',

  // Title screen
  titleScreen: 'reimagined',
  titleMotion: 'drifting',
  titleFollowsProgress: true,
  titleSword: 'progress',

  // Controls
  activeInputProfileId: null,
  enhancedSaveSlotShortcut: true,
  saveHoldDuration: 2,

  // Haptics
  haptics: {
    enabled: true,
    intensity: 70,
    swordSwing: true,
    swordHitEnemy: true,
    swordClink: true,
    damageTaken: true,
    itemUse: true,
    dashVibration: true,
    environmentalEffects: true,
  },
  hapticsEnabled: true,

  // Cheats
  cheatsEnabled: false,
  vanillaSafe: false,

  // Second cartridge
  extraDungeon: false,

  // Developer
  developerToolsEnabled: false,
  devNavigationData: true,
  allowDebugLogging: false,

  // Host systems
  trackerEnabled: true,

  // Online notices: one toast toggle per kind
  ...ONLINE_NOTICE_DEFAULTS,
  // Randomizer rupees, bombs and arrows arrive without a hold-up or message
  ...QUIET_RECEIPT_DEFAULTS,
};

const boolToIni = (v: boolean): string => {
  return v ? '1' : '0';
};

// An unset mode is the 'idle' default.
const offscreenAiMode = (s: GameSettings): OffscreenAiMode => {
  return s.offscreenAI ?? 'idle';
};

const serializeToIni = (settings: GameSettings, msuPath?: string, language?: string): string => {
  // ExtendedAspectRatio carries ONLY the ratio value (+ extend_y); every rendering companion is its own
  // [Features] key below. With extendedRendering off the engine gets vanilla 4:3, no flags.
  // aspectRatio/extendY are baked at boot from this INI, not carried in the gate words, so the C-side
  // parity mask can't reach them: Vanilla Safe must force `er` off here, which collapses every
  // dependent render flag below with it.
  const er = !settings.vanillaSafe && settings.extendedRendering;
  const parts: string[] = [];
  if (er) {
    if (settings.extendY) parts.push('extend_y');
    // The ratio the capabilities actually cover. Auto, Screen and Custom skip the picker's own gates, so
    // without this a wide monitor on Auto asked the core for a shape its feature bits were never set for.
    parts.push(ratioToString(allowedRatio(settings)));
  } else {
    parts.push('4:3');
  }
  const aspectValue = parts.join(', ');

  // Rendering feature flags mirror buildFeatureFlags (live bridge) so boot config and live push agree.
  // What the profile actually renders, not what its ratio word says: Auto on a 4:3 display is 4:3, and a
  // ratio the capabilities do not cover is pulled back to one they do. Wider or taller both count.
  const wide = rendersExtended(settings);
  const renderFlags = {
    ExtendedRendering: er,
    LinearWorldTilemap: er && !!settings.linearWorldTilemap,
    UltrawideRendering: er && !!settings.ultrawideRendering,
    TallRendering: er && !!settings.tallRendering,
    WidescreenSprites: wide && settings.widescreenSprites,
    WidescreenVisualFixes: wide && settings.widescreenVisualFixes,
    PauseOffscreenAI: er && offscreenAiMode(settings) === 'paused',
    CameraLock: er && settings.cameraLockToViewport,
    SmoothTransitions: er && settings.cameraLockToViewport && !!settings.smoothTransitions,
  };
  const renderFlagsIni = Object.entries(renderFlags)
    .map(([k, v]) => `${k} = ${boolToIni(v)}`)
    .join('\n');

  // Custom MSU music has no gate-word bit (a pure Electron/renderer + config.c toggle, never read by
  // the emulated CPU), so Vanilla Safe has to force it off at the INI boundary.
  const msuEnabledIni = settings.vanillaSafe ? 'false' : settings.enableMSU;
  const msuPathIni = settings.vanillaSafe ? undefined : msuPath;

  // Custom player sprite has no gate-word bit until config.features3 reflects it (see
  // ApplyConfiguredPlayerSprite in emscripten_main.c); the boot path treats this key's presence as
  // "override on", so it must not be written under Vanilla Safe.
  const linkGraphicsIni = !settings.vanillaSafe && settings.linkSprite ? 'LinkGraphics = /link_sprite.zspr\n' : '';

  return `[General]
${language ? `Language = ${language}\n` : ''}Autosave = ${boolToIni(settings.autosave)}
DisplayPerfInTitle = ${boolToIni(settings.displayPerfInTitle)}
DisableFrameDelay = ${boolToIni(settings.disableFrameDelay)}
ExtendedAspectRatio = ${aspectValue}

[Graphics]
WindowSize = Auto
Fullscreen = ${settings.fullscreen}
WindowScale = ${settings.windowScale}
NewRenderer = ${boolToIni(settings.newRenderer)}
EnhancedMode7 = ${boolToIni(settings.enhancedMode7)}
NoSpriteLimits = ${boolToIni(settings.noSpriteLimits)}
LinearFiltering = ${boolToIni(settings.linearFiltering && !settings.pixelPerfect)}
OutputMethod = ${settings.outputMethod}
DimFlashes = ${boolToIni(settings.dimFlashes)}
${linkGraphicsIni}

[Sound]
EnableAudio = ${boolToIni(settings.enableAudio)}
AudioFreq = ${settings.audioFreq}
AudioChannels = ${settings.audioChannels}
AudioSamples = ${settings.audioSamples}
EnableMSU = ${msuEnabledIni}
ResumeMSU = ${boolToIni(settings.resumeMSU)}
MSUVolume = ${settings.musicVolume}
PerGroupVolume = ${boolToIni(settings.perGroupVolume)}
${msuPathIni ? `MSUPath = ${msuPathIni}
` : ''}
[Features]
ItemSwitchLR = ${boolToIni(settings.itemSwitchLR)}
ItemSwitchLRLimit = ${boolToIni(settings.itemSwitchLRLimit)}
InventoryReorder = ${boolToIni(settings.inventoryReorder)}
SecondaryItemSlots = ${boolToIni(settings.secondaryItemSlots)}
AutoSkipDialog = ${boolToIni(settings.autoSkipDialog)}
PrefillFileName = ${boolToIni(settings.prefillFileName)}
TurnWhileDashing = ${boolToIni(settings.turnWhileDashing)}
AllowDiving = ${boolToIni(settings.allowDiving || settings.extraDungeon)}
MirrorToDarkworld = ${boolToIni(settings.mirrorToDarkworld)}
CollectItemsWithSword = ${boolToIni(settings.collectItemsWithSword)}
BreakPotsWithSword = ${boolToIni(settings.breakPotsWithSword)}
DisableLowHealthBeep = ${boolToIni(settings.disableLowHealthBeep)}
SkipIntroOnKeypress = ${boolToIni(settings.skipIntroOnKeypress)}
ShowMaxItemsInYellow = ${boolToIni(settings.showMaxItemsInYellow)}
MoreActiveBombs = ${boolToIni(settings.moreActiveBombs)}
CarryMoreRupees = ${boolToIni(settings.carryMoreRupees)}
MiscBugFixes = ${boolToIni(settings.miscBugFixes)}
GameChangingBugFixes = ${boolToIni(settings.gameChangingBugFixes)}
CancelBirdTravel = ${boolToIni(settings.cancelBirdTravel)}
DisableTelepathy = ${boolToIni(settings.disableTelepathy)}
Haptics = ${boolToIni(!!settings.haptics?.enabled)}
DeveloperTools = ${boolToIni(settings.developerToolsEnabled)}
CheatsEnabled = ${boolToIni(settings.cheatsEnabled)}
VanillaSafe = ${boolToIni(settings.vanillaSafe)}
${renderFlagsIni}
`;
};

const mergeSettings = (partial: Partial<GameSettings>): GameSettings => {
  const merged = { ...DEFAULT_SETTINGS, ...partial };

  // Tall rendering forces the enhanced HUD: the native HUD is a fixed 4:3 tile strip, wrong under tall.
  // Forcing it here (not in the settings UI) covers every consumer at once: INI, live push and HUD gate
  // word all read this merged value.
  if (merged.tallRendering) {
    merged.hudMode = 'enhanced';
    if (!merged.hudEnhancedParts.includes('main'))
      merged.hudEnhancedParts = [...merged.hudEnhancedParts, 'main'];
  }

  // enableAudio is no longer exposed in UI; always keep enabled
  merged.enableAudio = true;

  return merged;
};

export { DEFAULT_SETTINGS, mergeSettings, serializeToIni, offscreenAiMode, rendersExtended };
