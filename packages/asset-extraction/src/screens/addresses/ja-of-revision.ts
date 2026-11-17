/* @layer shared-asset-extraction @kind logic */
import type { RomRevision } from '../../rom/rom-types';
import type { JaScreenAddressTable } from './ja.type';
import { JA_REV1_SCREEN_ADDRESSES } from './ja-rev1';
import { JA_V1_0_SCREEN_ADDRESSES } from './ja-v1.0';

const jaScreenAddressesOf = (revision: RomRevision): JaScreenAddressTable =>
  revision === 0 ? JA_V1_0_SCREEN_ADDRESSES : JA_REV1_SCREEN_ADDRESSES;

export { jaScreenAddressesOf };
