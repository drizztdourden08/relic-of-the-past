/* @layer shared-asset-extraction @kind logic */
import { ROM_BANK_BYTES, SMC_HEADER_BYTES } from './rom-loader.constants';

const stripSmcHeader = (bytes: Buffer): Buffer =>
  bytes.length % ROM_BANK_BYTES === SMC_HEADER_BYTES ? bytes.subarray(SMC_HEADER_BYTES) : bytes;

export { stripSmcHeader };
