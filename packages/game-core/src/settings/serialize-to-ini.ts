/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { allowedRatio, effectiveExtendY, ratioToString, renderHeight, rendersExtended } from '../ratio-capability';
import { boolToIni } from './bool-to-ini';
import { offscreenEnemyMode } from './offscreen-enemy-mode';
import { LINK_GRAPHICS_LINE } from './settings.constants';

const aspectRatioIni = (settings: GameSettings, extendedRendering: boolean): string => {
  const parts: string[] = [];
  if (extendedRendering) {
    if (effectiveExtendY(settings)) parts.push('extend_y');
    parts.push(settings.aspectRatio === 'original' ? '4:3' : ratioToString(allowedRatio(settings), renderHeight(settings)));
  } else {
    parts.push('4:3');
  }
  return parts.join(', ');
};

const renderFlagsIni = (settings: GameSettings, extendedRendering: boolean): string => {
  const er = extendedRendering;
  const showsMoreThanOriginal = rendersExtended(settings);
  const renderFlags = {
    ExtendedRendering: er,
    LinearWorldTilemap: er && Boolean(settings.linearWorldTilemap),
    UltrawideRendering: er && Boolean(settings.ultrawideRendering),
    TallRendering: er && Boolean(settings.tallRendering),
    WidescreenSprites: showsMoreThanOriginal && settings.widescreenSprites,
    WidescreenVisualFixes: showsMoreThanOriginal && settings.widescreenVisualFixes,
    PauseOffscreenAI: er && offscreenEnemyMode(settings) === 'paused',
    CameraLock: er && settings.cameraLockToViewport,
    SmoothTransitions: er && settings.cameraLockToViewport && Boolean(settings.smoothTransitions),
  };
  return Object.entries(renderFlags)
    .map(([k, v]) => `${k} = ${boolToIni(v)}`)
    .join('\n');
};

const optionalLine = (key: string, value: string | undefined): string => (value ? `${key} = ${value}\n` : '');

const serializeToIni = (settings: GameSettings, msuPath?: string, language?: string): string => {
  const er = !settings.vanillaSafe && settings.extendedRendering;
  const aspectValue = aspectRatioIni(settings, er);
  const renderFlags = renderFlagsIni(settings, er);

  const msuEnabledIni = settings.vanillaSafe ? 'false' : settings.enableMSU;
  const msuPathIni = settings.vanillaSafe ? undefined : msuPath;

  const linkGraphicsIni = !settings.vanillaSafe && settings.linkSprite ? LINK_GRAPHICS_LINE : '';

  return `[General]
${optionalLine('Language', language)}DisplayPerfInTitle = ${boolToIni(settings.displayPerfInTitle)}
ExtendedAspectRatio = ${aspectValue}

[Graphics]
WindowSize = Auto
NewRenderer = ${boolToIni(settings.newRenderer)}
EnhancedMode7 = ${boolToIni(settings.enhancedMode7)}
NoSpriteLimits = ${boolToIni(settings.noSpriteLimits)}
LinearFiltering = ${boolToIni(settings.linearFiltering && !settings.pixelPerfect)}
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
${optionalLine('MSUPath', msuPathIni)}
[Features]
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
Haptics = ${boolToIni(settings.haptics.enabled)}
DeveloperTools = ${boolToIni(settings.developerToolsEnabled)}
CheatsEnabled = ${boolToIni(settings.cheatsEnabled)}
VanillaSafe = ${boolToIni(settings.vanillaSafe)}
${renderFlags}
`;
};

export { serializeToIni };
