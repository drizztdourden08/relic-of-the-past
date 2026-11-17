/* @layer shared-asset-extraction @kind barrel */
import type { RomLanguage } from '../../rom/rom-types';
import type { ScreenAddressTable } from '../screen-payload.type';
import { US_SCREEN_ADDRESSES } from './us';

const kScreenAddresses: Readonly<Partial<Record<RomLanguage, ScreenAddressTable>>> = {
  us: US_SCREEN_ADDRESSES,
};

export { kScreenAddresses, US_SCREEN_ADDRESSES };
