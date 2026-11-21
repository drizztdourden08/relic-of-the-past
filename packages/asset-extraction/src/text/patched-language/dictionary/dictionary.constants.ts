/* @layer shared-asset-extraction @kind constants */
const MAX_ENTRY_BYTES = 24;

const BANK_BYTES = 0x8000;

const BANK_OFFSET_MASK = 0x7fff;

const ROM_ADDRESS_BIT = 0x8000;

export { BANK_BYTES, BANK_OFFSET_MASK, MAX_ENTRY_BYTES, ROM_ADDRESS_BIT };
