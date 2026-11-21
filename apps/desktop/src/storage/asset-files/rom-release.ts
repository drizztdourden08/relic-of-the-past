/* @layer renderer-lib @kind logic */
import { sha1Hex } from '@drizztdourden08/brock-port-kit';
import { ZELDA3_SHA1, stripSmcHeader } from '@rotp/asset-extraction';
import type { RomRelease } from './asset-files.type';

const romRelease = async (bytes: Uint8Array): Promise<RomRelease | null> =>
  ZELDA3_SHA1[(await sha1Hex(stripSmcHeader(bytes))).toUpperCase()] ?? null;

export { romRelease };
