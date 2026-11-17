/* @layer shared-asset-extraction @kind constants */
const JA_GFX_INTRO_BG_SHEETS: readonly number[] = [22, 23, 29, 30, 57, 64, 65];

const JA_GFX_HUD_SPR_SHEETS: readonly number[] = [105, 106];

const JA_GFX_INTRO_TILEMAP_ID = 0x45;

const JA_GFX_BG_BASE = 0x200;

const JA_GFX_SPR_BASE = 0x100;

const JA_GFX_PATCH_BASE = 0x300;

const JA_GFX_PACK_MAGIC = 0x4a41;

const JA_GFX_ENTRY_HEADER_BYTES = 8;

export {
  JA_GFX_BG_BASE, JA_GFX_ENTRY_HEADER_BYTES, JA_GFX_HUD_SPR_SHEETS, JA_GFX_INTRO_BG_SHEETS, JA_GFX_INTRO_TILEMAP_ID,
  JA_GFX_PACK_MAGIC, JA_GFX_PATCH_BASE, JA_GFX_SPR_BASE,
};
