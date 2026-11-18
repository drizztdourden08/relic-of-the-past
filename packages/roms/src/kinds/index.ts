/* @layer shared-storage @kind barrel */
export { ROM_KINDS } from './rom-kind-specs.constants';
export { ROM_KIND_LIST } from './rom-kinds.constants';
export { kindOfFile } from './kind-of-file';
export { officialRomStatuses } from './official-roms';
export { checkOfficialRom } from './check-official-rom';
export { checkPatchedRom } from './check-patched-rom';
export { fanTranslationMessage } from './fan-translation-message';
export type { RomVerdict } from './rom-verdict.type';
export type { OfficialRom, OfficialRomStatus } from './official-roms.type';
export type { RomKind, RomKindSpec } from './rom-kinds.type';
