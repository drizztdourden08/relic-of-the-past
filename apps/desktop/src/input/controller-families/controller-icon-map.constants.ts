/* @layer renderer-lib @kind constants */
import { publicAsset } from '@app/public-asset/public-asset';

const CONTROLLER_ICON_MAP: Readonly<Record<string, string>> = {
  nintendo: publicAsset('buttons/switch/controller_switch_pro.svg'),
  xbox: publicAsset('buttons/xbox/controller_xboxseries.svg'),
  playstation: publicAsset('buttons/playstation/controller_playstation5.svg'),
};

export { CONTROLLER_ICON_MAP };
