/* @layer bridge-wasm @kind constants */
const SRAM_BYTES = 0x2000;
const SLOT_BYTES = 0x500;
const SLOT_WORDS = 0x280;
const BACKUP_OFFSET = 0xf00;
const SRAM_SLOT_COUNT = 3;
const VALID_CHECKSUM = 0x5a5a;

export { SRAM_BYTES, SLOT_BYTES, SLOT_WORDS, BACKUP_OFFSET, SRAM_SLOT_COUNT, VALID_CHECKSUM };
