/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { capitalizeSetting } from './capitalize-setting';
import type { SettingsSection } from './settings-sections.type';

const DISPLAY_SECTION: SettingsSection = {
  title: msg('data-manager:settings-sections.title.display'),
  keys: [
    { key: 'aspectRatio', label: msg('data-manager:settings-sections.label.aspect-ratio') },
    { key: 'extendY', label: msg('data-manager:settings-sections.label.extend-y') },
    { key: 'cameraLockToViewport', label: msg('data-manager:settings-sections.label.camera-lock-to-viewport') },
    { key: 'widescreenSprites', label: msg('data-manager:settings-sections.label.widescreen-sprites') },
    { key: 'widescreenVisualFixes', label: msg('data-manager:settings-sections.label.widescreen-visual-fixes') },
    { key: 'windowMode', label: msg('data-manager:settings-sections.label.window-mode'), format: (v, t) => capitalizeSetting(v, 'windowed', t) },
    { key: 'displayMonitor', label: msg('data-manager:settings-sections.label.display-monitor'), format: (v, t) => (v ? String(v) : t('data-manager:settings-sections.value.current')) },
    { key: 'startFullscreen', label: msg('data-manager:settings-sections.label.start-fullscreen') },
    { key: 'viewportConstraint', label: msg('data-manager:settings-sections.label.viewport-constraint'), format: (v, t) => capitalizeSetting(v, 'none', t) },
    { key: 'pixelPerfect', label: msg('data-manager:settings-sections.label.pixel-perfect') },
    { key: 'syncedRateInFullscreen', label: msg('data-manager:settings-sections.label.synced-rate-in-fullscreen') },
    { key: 'syncedRateTargetHz', label: msg('data-manager:settings-sections.label.synced-rate-target-hz'), format: (v, t) => (Number(v) > 0 ? `${v} Hz` : t('data-manager:settings-sections.value.highest')) },
  ],
};

const GRAPHICS_SECTION: SettingsSection = {
  title: msg('data-manager:settings-sections.title.graphics'),
  keys: [
    { key: 'newRenderer', label: msg('data-manager:settings-sections.label.new-renderer') },
    { key: 'enhancedMode7', label: msg('data-manager:settings-sections.label.enhanced-mode7') },
    { key: 'noSpriteLimits', label: msg('data-manager:settings-sections.label.no-sprite-limits') },
    { key: 'linearFiltering', label: msg('data-manager:settings-sections.label.linear-filtering') },
    { key: 'dimFlashes', label: msg('data-manager:settings-sections.label.dim-flashes') },
    { key: 'postProcessingShadows', label: msg('data-manager:settings-sections.label.post-processing-shadows') },
    { key: 'coloredRupees', label: msg('data-manager:settings-sections.label.colored-rupees') },
    { key: 'itemSheen', label: msg('data-manager:settings-sections.label.item-sheen') },
    { key: 'hideSpaceBeyondWalls', label: msg('data-manager:settings-sections.label.hide-space-beyond-walls') },
    { key: 'linkSprite', label: msg('data-manager:settings-sections.label.link-sprite'), format: (v, t) => (v ? String(v) : t('data-manager:settings-sections.value.original')) },
  ],
};

const HUD_SECTION: SettingsSection = {
  title: msg('data-manager:settings-sections.title.hud-and-title-screen'),
  keys: [
    { key: 'hudMode', label: msg('data-manager:settings-sections.label.hud-mode'), format: (v, t) => capitalizeSetting(v, 'original', t) },
    { key: 'hudStyle', label: msg('data-manager:settings-sections.label.hud-style'), format: (v, t) => capitalizeSetting(v, 'vanilla', t) },
    { key: 'hudRatio', label: msg('data-manager:settings-sections.label.hud-ratio'), format: (v, t) => capitalizeSetting(v, 'match', t) },
    { key: 'hudHeartMode', label: msg('data-manager:settings-sections.label.hud-heart-mode'), format: (v, t) => capitalizeSetting(v, 'original', t) },
    { key: 'hudMagicMode', label: msg('data-manager:settings-sections.label.hud-magic-mode'), format: (v, t) => capitalizeSetting(v, 'original', t) },
    { key: 'hudCountLayout', label: msg('data-manager:settings-sections.label.hud-count-layout'), format: (v, t) => capitalizeSetting(v, 'centered', t) },
    { key: 'hudCountdownStyle', label: msg('data-manager:settings-sections.label.hud-countdown-style'), format: (v, t) => capitalizeSetting(v, 'pixel', t) },
    { key: 'titleScreen', label: msg('data-manager:settings-sections.label.title-screen'), format: (v, t) => capitalizeSetting(v, 'original', t) },
    { key: 'titleMotion', label: msg('data-manager:settings-sections.label.title-motion'), format: (v, t) => capitalizeSetting(v, 'still', t) },
    { key: 'titleFollowsProgress', label: msg('data-manager:settings-sections.label.title-follows-progress') },
    { key: 'langMenuScreens', label: msg('data-manager:settings-sections.label.lang-menu-screens') },
    { key: 'jaFileSelectStyle', label: msg('data-manager:settings-sections.label.ja-file-select-style') },
    { key: 'langPauseWords', label: msg('data-manager:settings-sections.label.lang-pause-words') },
    { key: 'langMapLabels', label: msg('data-manager:settings-sections.label.lang-map-labels') },
    { key: 'langEndingCredits', label: msg('data-manager:settings-sections.label.lang-ending-credits') },
  ],
};

export { DISPLAY_SECTION, GRAPHICS_SECTION, HUD_SECTION };
