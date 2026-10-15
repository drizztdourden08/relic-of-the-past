/* @layer shared-game @kind barrel */
export type {
  DialogueEntry, GlossaryTerm, LanguageSet, LanguageSetMeta, NameTable, PauseLabelKey,
  SetStructure, Token,
} from './types';
export { resolveRefs } from './glossary/resolve-refs';
export { emptyNameTable } from './pack-set/empty-name-table';
export { setFromPack } from './pack-set/set-from-pack';
export { parseTokens } from './tokens/parse-tokens';
export { serializeTokens } from './tokens/serialize-tokens';
export { validateEntry } from './validate/validate-entry';
export type { EntryIssue } from './validate/validate.type';
export { compileSet } from './compile/compile-set';
export { compileSets } from './compile/compile-sets';
export type { SetBakeInput, SetFont } from './compile/compile.type';
export { ROW_WIDTH_PX, ROWS_PER_BOX } from './layout/types';
export type { GlyphMetrics, GlyphSheet, RowFit, ScreenFit } from './layout/types';
export {
  buildGlyphMetrics, glyphIndexOf, matchGlyphs, widthOf, FALLBACK_ADVANCE_PX,
} from './layout/glyph-metrics';
export type { GlyphMatch, GlyphRun } from './layout/glyph-metrics';
export { layoutPlan, MAX_NAME_GLYPHS } from './layout/layout-plan';
export type { LayoutOptions, LayoutPlan } from './layout/layout-plan';
export { measureRows, measureRowsDetailed } from './layout/measure-line';
export type { RowMeasurement } from './layout/measure-line';
export { splitScreens } from './layout/split-screens';
export { advanceForNewLine, joinLines, lineMetrics, splitLines } from './lines';
export type { DialogueLineView, LineAdvance, LineMetrics } from './lines';
export { flattenBlocks, resolveInherited, splitBlocks } from './blocks';
export type { Block, BlockDoc } from './blocks';
export {
  choiceShapeOf, tokensFromChoice, withAddedOption, withOptionTokens, withRemovedOption,
} from './choices';
export type { ChoiceCode, ChoiceOption, ChoiceShape } from './choices';
export { CODE_CATALOG, codeInfoFor, encodableParams, isGlyphName, structuralEntry, STRUCTURAL_IDS } from './codes';
export type { CodeInfo, CodeParamRange, CodeRisk, CodeScope, StructuralEntry } from './codes';
export {
  buildVariableIndex, builtinVariables, findHardcoded, nameTablesFromVariables, mergeVariableMeta,
  resolve, scanRun, variablesFromNameTables,
} from './variables';
export type {
  NameTableData, Occurrence, ResolveOptions, Variable, VariableIndex, VariableKind,
} from './variables';
export {
  applyEnter, continueByScrolling, endBlockAt, locateCaret, policyFor, reflow, STRUCTURE_MODES,
} from './structure';
export type {
  Caret, CaretSite, StructureContext, StructureMode, StructurePolicy,
} from './structure';
export { buildGroups, GROUP_TITLES, pauseNameSlots, slotsFromDecoded, worldNameSlots } from './text';
export type {
  BuildGroupsParams, DecodedLine, DecodedSlotOptions, NamedKind, NamedRecord, RecordSource,
  TextGroup, TextGroupId, TextLimit, TextOverrides, TextSlot,
} from './text';
