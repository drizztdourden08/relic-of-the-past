/* @layer renderer-components @kind constants */
import { publicAsset } from '../../public-asset/public-asset';
import { BUTTON_ICON_PATHS } from '@rotp/input-mapping';

const BUTTON_ICON_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(BUTTON_ICON_PATHS).map(([iconId, path]) => [iconId, publicAsset(path)]),
);

export { BUTTON_ICON_MAP };
