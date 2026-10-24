/* @layer renderer-lib @kind logic */
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import { controllerCardInfo } from '@rotp/input-mapping';
import { PLACEHOLDER_NAME, XBOX_360_NAME, XBOX_WIRELESS_NAME, XINPUT_NAME } from './controller-names.constants';

const isPlaceholder = (name: string): boolean => PLACEHOLDER_NAME.test(name.trim());

const xboxName = (entry: DeviceEntry): string => {
  const wireless = entry.connectionState === 'wireless' || entry.busType === 'bluetooth';
  return !wireless && entry.sdlType === 'xbox360' ? XBOX_360_NAME : XBOX_WIRELESS_NAME;
};

const padDisplayName = (entry: DeviceEntry): string => {
  const sdlName = controllerCardInfo(entry).displayName;
  if (!isPlaceholder(sdlName)) return sdlName;
  const product = entry.product.trim();
  if (product !== '' && !isPlaceholder(product)) return product;
  return entry.family === 'xbox' || XINPUT_NAME.test(sdlName) ? xboxName(entry) : sdlName;
};

export { padDisplayName };
