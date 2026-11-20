/* @layer shared-asset-extraction @kind barrel */
import type { RomLanguage } from '../../rom/rom-types';
import type { ScreenAddressTable } from '../screen-payload.type';
import { DE_SCREEN_ADDRESSES } from './de';
import { EN_SCREEN_ADDRESSES } from './en';
import { FR_SCREEN_ADDRESSES } from './fr';
import { FR_C_SCREEN_ADDRESSES } from './fr-c';
import { JA_REV1_SCREEN_ADDRESSES } from './ja-rev1';
import { JA_V1_0_SCREEN_ADDRESSES } from './ja-v1.0';
import { jaScreenAddressesOf } from './ja-of-revision';
import { US_SCREEN_ADDRESSES } from './us';

const kScreenAddresses: Readonly<Partial<Record<RomLanguage, ScreenAddressTable>>> = {
  us: US_SCREEN_ADDRESSES,
  en: EN_SCREEN_ADDRESSES,
  fr: FR_SCREEN_ADDRESSES,
  'fr-c': FR_C_SCREEN_ADDRESSES,
  de: DE_SCREEN_ADDRESSES,
};

export { jaScreenAddressesOf, kScreenAddresses, US_SCREEN_ADDRESSES };
