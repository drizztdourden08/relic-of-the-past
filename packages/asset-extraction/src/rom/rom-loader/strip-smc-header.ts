/* @layer shared-asset-extraction @kind logic */
import { ROM_BANK_BYTES, SMC_HEADER_BYTES } from './rom-loader.constants';

const stripSmcHeader = <T extends Uint8Array>(bytes: T): T =>
  bytes.length % ROM_BANK_BYTES === SMC_HEADER_BYTES ? bytes.subarray(SMC_HEADER_BYTES) as T : bytes;

export { stripSmcHeader };
