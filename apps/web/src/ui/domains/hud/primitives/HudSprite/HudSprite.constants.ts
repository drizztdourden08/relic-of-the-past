/* @layer renderer-hud @kind constants */
import type { SilhouetteTone } from './HudSprite.type';

const SILHOUETTE_TONES: Readonly<Record<SilhouetteTone, string>> = {
  dark: 'brightness(0) opacity(0.32)',
  light: 'brightness(0) invert(0.93) sepia(0.55) opacity(0.42)',
};

const SILHOUETTE_VAR = '--hud-silhouette';
const SILHOUETTE_FILTER = `var(${SILHOUETTE_VAR}, ${SILHOUETTE_TONES.dark})`;

export { SILHOUETTE_FILTER, SILHOUETTE_TONES, SILHOUETTE_VAR };
