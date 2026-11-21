/* @layer shared-asset-extraction @kind constants */
const STRIPE_END = 0x80;

const MEMSET_FLAG = 0x40;

const LENGTH_MASK = 0x3fff;

const HEADER_BYTES = 4;

const MEMSET_PAYLOAD_BYTES = 2;

export { HEADER_BYTES, LENGTH_MASK, MEMSET_FLAG, MEMSET_PAYLOAD_BYTES, STRIPE_END };
