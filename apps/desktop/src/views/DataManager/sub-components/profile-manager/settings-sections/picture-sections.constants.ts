/* @layer renderer-components @kind constants */
import { capitalizeSetting } from './capitalize-setting';
import type { SettingsSection } from './settings-sections.type';

const DISPLAY_SECTION: SettingsSection = {
  title: 'Display',
  keys: [
    { key: 'aspectRatio', label: 'Aspect ratio' },
    { key: 'extendY', label: 'Extend Y' },
    { key: 'cameraLockToViewport', label: 'Lock camera to view' },
    { key: 'widescreenSprites', label: 'Widescreen sprites' },
    { key: 'widescreenVisualFixes', label: 'Widescreen fixes' },
    { key: 'windowMode', label: 'Window mode', format: (v) => capitalizeSetting(v, 'windowed') },
    { key: 'displayMonitor', label: 'Screen', format: (v) => (v ? String(v) : 'Current') },
    { key: 'startFullscreen', label: 'Start fullscreen' },
    { key: 'viewportConstraint', label: 'Viewport constraint', format: (v) => capitalizeSetting(v, 'none') },
    { key: 'pixelPerfect', label: 'Pixel perfect' },
    { key: 'syncedRateInFullscreen', label: 'Synced refresh rate (fullscreen)' },
    { key: 'syncedRateTargetHz', label: 'Target refresh rate', format: (v) => (Number(v) > 0 ? `${v} Hz` : 'Highest') },
  ],
};

const GRAPHICS_SECTION: SettingsSection = {
  title: 'Graphics',
  keys: [
    { key: 'newRenderer', label: 'New renderer' },
    { key: 'enhancedMode7', label: 'HD Mode 7' },
    { key: 'noSpriteLimits', label: 'No sprite limits' },
    { key: 'linearFiltering', label: 'Linear filtering' },
    { key: 'dimFlashes', label: 'Dim flashes' },
    { key: 'postProcessingShadows', label: 'Shadows' },
    { key: 'coloredRupees', label: 'Colored rupees' },
    { key: 'itemSheen', label: 'Item sheen' },
    { key: 'hideSpaceBeyondWalls', label: 'Hide space beyond walls' },
    { key: 'linkSprite', label: 'Link sprite', format: (v) => (v ? String(v) : 'Original') },
  ],
};

const HUD_SECTION: SettingsSection = {
  title: 'HUD and title screen',
  keys: [
    { key: 'hudMode', label: 'HUD', format: (v) => capitalizeSetting(v, 'original') },
    { key: 'hudStyle', label: 'HUD style', format: (v) => capitalizeSetting(v, 'vanilla') },
    { key: 'hudRatio', label: 'HUD ratio', format: (v) => capitalizeSetting(v, 'match') },
    { key: 'hudHeartMode', label: 'Hearts', format: (v) => capitalizeSetting(v, 'original') },
    { key: 'hudMagicMode', label: 'Magic meter', format: (v) => capitalizeSetting(v, 'original') },
    { key: 'hudCountLayout', label: 'Counter layout', format: (v) => capitalizeSetting(v, 'centered') },
    { key: 'hudCountdownStyle', label: 'Countdown style', format: (v) => capitalizeSetting(v, 'pixel') },
    { key: 'titleScreen', label: 'Title screen', format: (v) => capitalizeSetting(v, 'original') },
    { key: 'titleMotion', label: 'Title motion', format: (v) => capitalizeSetting(v, 'still') },
    { key: 'titleFollowsProgress', label: 'Title follows progress' },
  ],
};

export { DISPLAY_SECTION, GRAPHICS_SECTION, HUD_SECTION };
