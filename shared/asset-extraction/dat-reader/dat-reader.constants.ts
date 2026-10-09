/* @layer shared-asset-extraction @kind constants */
const SIGNATURE = 'Zelda3_v0     \n\0';
const SIG_BYTES = 16;
const HASH_BYTES = 32;
const PAD_BYTES = 32;
const COUNT_AT = SIG_BYTES + HASH_BYTES + PAD_BYTES;
const HEADER_BYTES = COUNT_AT + 8;

export { COUNT_AT, HEADER_BYTES, SIGNATURE };
