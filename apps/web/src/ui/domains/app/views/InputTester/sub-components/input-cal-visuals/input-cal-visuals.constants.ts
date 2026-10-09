/* @layer renderer-components @kind constants */
import type { CSSProperties } from 'react';
import { publicAsset } from '@app/lib/assets/public-asset';

const VIS_STYLES: Record<string, CSSProperties> = {
  triggerTrack: { width: 24, height: 60, borderRadius: 4, border: '1px solid var(--c-border)', background: 'var(--c-surface)', position: 'relative', overflow: 'hidden' },
  svgAbs: { position: 'absolute', top: 0, left: 0 },
  dirIcon: { width: 32, height: 32, marginTop: 2, opacity: 0.85 },
};

const CONTROLLER_ICON_MAP: Record<string, string> = {
  nintendo: publicAsset('buttons/switch/controller_switch_pro.svg'),
  xbox: publicAsset('buttons/xbox/controller_xboxseries.svg'),
  playstation: publicAsset('buttons/playstation/controller_playstation5.svg'),
};

const TRIGGER_BAR_HEIGHT = 60;
const RECORD_DONE_FLASH_MS = 2000;
const STICK_VIEW_CENTER = 40;
const STICK_VIEW_RADIUS = 36;

export { VIS_STYLES, CONTROLLER_ICON_MAP, TRIGGER_BAR_HEIGHT, RECORD_DONE_FLASH_MS, STICK_VIEW_CENTER, STICK_VIEW_RADIUS };
