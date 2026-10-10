/* @layer shared-asset-extraction @kind logic */
export type { RomData, RomLanguage, RomIdentEntry } from './rom/rom-types';
export { snesToLinear, advanceAddress, advanceAddressWord } from './rom/snes-address';
export { ZELDA3_SHA1, ZELDA3_SHA1_US } from './rom/rom-loader/rom-loader.constants';
export { RomReader } from './rom/reader';

export {
  decompress, decompressFromRom, decompressFromRomWithLength,
  decodeBrr, encodeBrr,
} from './compression';

export {
  type RGBA,
  snesToRgba, TRANSPARENT, loadPalette,
  decode2bppTile, decode3bppTile, decode4bppTile,
  decode2bppTileset, decode3bppTileset, decode4bppTileset,
  flipTileX, flipTileY,
  ImageBuffer,
} from './graphics';

export { kCompSpritePtrs, kCompBgPtrs } from './data';

export type { ExtractionResult } from './item-sprites';

export { ALTTP_GBA_US_SHA256 } from './rom/gba-rom/gba-rom.constants';
export { PALACE_ROOM_IDS } from './sources/gba-alttp/dungeon-source/dungeon-source.constants';
export type { AlttpAssetSources, CompiledAlttpAssetSet } from './compile-alttp-asset-set';
export { isCurrentBakeVersion } from './bake-version/is-current-bake-version';
export { findDatAsset } from './dat-container/find-dat-asset';
export { readDatEntry } from './dat-reader/read-dat-entry';
export { convertGbaMapWordToSnes } from './graphics/gba-native/convert-gba-map-word-to-snes';
export { convertGbaSheetToSnes4bpp } from './graphics/gba-native/convert-gba-sheet-to-snes-4bpp';
export { decodeGbaPacked4bppTile } from './graphics/gba-native/decode-gba-packed-4bpp-tile';
export { chromaOf } from './graphics/oklab/chroma-of';
export { toOklab } from './graphics/oklab/to-oklab';
export { extractArtBadge } from './item-sprites/art-badge';
export { artImage } from './item-sprites/art-picture';
export { CAPACITY_ICONS_FILE } from './item-sprites/capacity-icons/capacity-icons.constants';
export { CURRENCY_SYMBOLS_FILE } from './item-sprites/currency-symbols/currency-symbols.constants';
export type { SpriteBuffer, SpriteDef } from './item-sprites/extract-items/extract-items.type';
export { extractSpriteBuffers } from './item-sprites/extract-items/extract-sprite-buffers';
export { EXTRACTION_STAMP_FILE } from './item-sprites/extraction-stamp/extraction-stamp.constants';
export { extractionVersionOf } from './item-sprites/extraction-stamp/extraction-version-of';
export { parseExtractionStamp } from './item-sprites/extraction-stamp/parse-extraction-stamp';
export { buildForeignIconsFile } from './item-sprites/foreign-icons/build-foreign-icons-file';
export { FOREIGN_ICONS_FILE, FOREIGN_ICON_FILES, FOREIGN_ICON_PALETTE_BYTES } from './item-sprites/foreign-icons/foreign-icons.constants';
export { GEAR_ICONS_FILE } from './item-sprites/gear-icons/gear-icons.constants';
export { IN_GAME_BINARY_FILES } from './item-sprites/in-game-binaries/in-game-binaries.constants';
export { NEUTRAL_CHROMA } from './item-sprites/perceptual-match/perceptual-match.constants';
export { quantizeIconPerceptual } from './item-sprites/perceptual-quantize';
export { QUIVER_ICON_FILE } from './item-sprites/quiver-icon/quiver-icon.constants';
export { packPackedBytes } from './packed-bytes/pack-packed-bytes';
export { unpackPackedBytes } from './packed-bytes/unpack-packed-bytes';
export type { LanguageMeta, LanguagePack, LanguageSummary } from './sets-types/language.type';
export { extractEntityHandlerTable } from './sources/gba-alttp/behavior-source/extract-entity-handler-table';
export { extractRoomTagHandlerTable } from './sources/gba-alttp/behavior-source/extract-room-tag-handler-table';
export { extractDungeonPalette } from './sources/gba-alttp/graphics-source/extract-dungeon-palette';
export { extractPalaceSpritePalettes } from './sources/gba-alttp/graphics-source/extract-palace-sprite-palettes';
export { GBA_NEW_ENTITY_HANDLERS, PALACE_AUDIO_REFERENCES, PALACE_BEHAVIOR_SPECS, PALACE_BOSS_ROOMS, PALACE_ENTITY_TYPES, PALACE_PROGRESSION_ANCHORS, PALACE_ROOM_TAGS } from './sources/gba-alttp/palace-metadata';
export { decodeGbaAlttpSaveProgression } from './sources/gba-alttp/progression-source/decode-gba-alttp-save-progression';
export { extractGbaAlttpText } from './sources/gba-alttp/text-source/extract-gba-alttp-text';
export { SUPPLEMENT_IDS } from './sources/source-ids';
export type { AssetSourceId } from './sources/source-ids.type';
export type { PackedLangEntry } from './text/build-language-entry/build-language-entry.type';
export { buildPackedEntry } from './text/build-language-entry/build-packed-entry';
export { extractLangEntry } from './text/build-language-entry/extract-lang-entry';
export { kFontTypes } from './text/data/font-data';
export { GLYPH_RAMP } from './text/data/glyph-ramp';
export { usesNewFormat } from './text/data/language-data/uses-new-format';
export { randomizerTemplateTexts } from './text/data/randomizer-templates/randomizer-template-texts';
export { RANDOMIZER_MSG_BASE, RANDOMIZER_RECEIPT_MSG } from './text/data/randomizer-templates/randomizer-templates.constants';
export { formatDialogueText } from './text/dialogue-decoder/format-dialogue-text';
export { kCmdInfo } from './text/dialogue-encoder/cmd-info';
export { compressStrings } from './text/dialogue-encoder/compress-strings';
export { decodeEndingCaptions } from './text/menu-text/decode-captions';
export { decodeCredits } from './text/menu-text/decode-credits';
export { decodeMenuText } from './text/menu-text/decode-stripe-text';
export type { DecodedLine } from './text/menu-text/menu-text.type';
export { dialogueTexts } from './text/parse-dialogue-text/dialogue-texts';
export { parseDialogueText } from './text/parse-dialogue-text/parse-dialogue-text';
export { kLanguages } from './text/data/language-data/language-data.constants';
export type { LanguageConfig } from './text/data/language-data/language-data.type';
