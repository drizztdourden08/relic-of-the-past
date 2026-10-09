/* @layer renderer-components @kind constants */
import { publicAsset } from '@app/public-asset/public-asset';
import type { RumbleTest } from './ControllerCard.type';

const RUMBLE_TESTS: readonly RumbleTest[] = [
  { label: 'Sword Hit', hapticPattern: 'swordHitEnemy' },
];

const CONTROLLER_ICON_MAP: Record<string, string> = {
  nintendo: publicAsset('buttons/switch/controller_switch_pro.svg'),
  xbox: publicAsset('buttons/xbox/controller_xboxseries.svg'),
  playstation: publicAsset('buttons/playstation/controller_playstation5.svg'),
};

export { RUMBLE_TESTS, CONTROLLER_ICON_MAP };
