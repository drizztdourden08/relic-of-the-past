/* @layer shared-asset-extraction @kind barrel */
import type { RomLanguage } from '../../rom/rom-types';
import type { ScreenAddressTable } from '../screen-payload.type';
import { FR_SCREEN_ADDRESSES } from './fr';
import { FR_C_SCREEN_ADDRESSES } from './fr-c';
import { US_SCREEN_ADDRESSES } from './us';

const kScreenAddresses: Readonly<Partial<Record<RomLanguage, ScreenAddressTable>>> = {
  us: US_SCREEN_ADDRESSES,
  fr: FR_SCREEN_ADDRESSES,
  'fr-c': FR_C_SCREEN_ADDRESSES,
};

export { FR_C_SCREEN_ADDRESSES, FR_SCREEN_ADDRESSES, kScreenAddresses, US_SCREEN_ADDRESSES };
