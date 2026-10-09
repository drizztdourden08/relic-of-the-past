/* @layer renderer-components @kind constants */
import { publicAsset } from '../../assets/public-asset';
import { BUTTON_ICON_PATHS } from './button-icon-paths';

const BUTTON_ICON_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(BUTTON_ICON_PATHS).map(([iconId, path]) => [iconId, publicAsset(path)]),
);

export { BUTTON_ICON_MAP };
