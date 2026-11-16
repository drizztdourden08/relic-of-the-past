/* @layer shared-game @kind barrel */
export type {
  DialogueEntry, GlossaryTerm, LanguageSet, LanguageSetMeta, NameTable, PauseLabelKey,
  SetStructure, Token,
} from './types';
export { emptyNameTable } from './pack-set/empty-name-table';
export { setFromPack } from './pack-set/set-from-pack';
export { serializeTokens } from './tokens/serialize-tokens';
export { validateEntry } from './validate/validate-entry';
export type { EntryIssue } from './validate/validate.type';
export { compileSets } from './compile/compile-sets';
export type { SetBakeInput } from './compile/compile.type';
export { ROW_WIDTH_PX, ROWS_PER_BOX } from './layout/types';
export type { GlyphMetrics, GlyphSheet, RowFit } from './layout/types';
export {
  glyphIndexOf,
  widthOf,
} from './layout/glyph-metrics';
export { layoutPlan, MAX_NAME_GLYPHS } from './layout/layout-plan';
export type { LayoutOptions } from './layout/layout-plan';
export { measureRows } from './layout/measure-line';
export { splitScreens } from './layout/split-screens';
export { advanceForNewLine, joinLines, lineMetrics, splitLines } from './lines';
export type { DialogueLineView, LineAdvance } from './lines';
export { resolveInherited, splitBlocks } from './blocks';
export type { Block, BlockDoc } from './blocks';
export { codeInfoFor, encodableParams, isGlyphName, structuralEntry } from './codes';
export {
  buildVariableIndex,
  findHardcoded,
  nameTablesFromVariables,
  mergeVariableMeta,
  resolve,
  variablesFromNameTables,
} from './variables';
export type {
  Occurrence,
  Variable,
  VariableIndex,
  VariableKind,
} from './variables';
export {
  STRUCTURE_MODES,
} from './structure';
export type {
  StructureMode,
} from './structure';
export { buildGroups } from './text';
export type {
  DecodedLine,
  TextGroup,
  TextGroupId,
  TextLimit,
  TextOverrides,
  TextSlot,
} from './text';
