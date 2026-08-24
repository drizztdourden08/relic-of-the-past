/* @layer shared-game @kind barrel */
export type {
  DialogueEntry, GlossaryTerm, LanguageSet, LanguageSetMeta, NameTable, PauseLabelKey,
  SetStructure, Token,
} from './types';
export { resolveRefs } from './glossary/resolve-refs';
export { emptyNameTable, setFromPack } from './migrate/set-from-pack';
export { parseTokens } from './tokens/parse-tokens';
export { serializeTokens } from './tokens/serialize-tokens';
export { validateEntry } from './validate/validate-entry';
export type { EntryIssue } from './validate/validate-entry';
export { compileSet } from './compile/compile-set';
export type { SetFont } from './compile/compile-set';
export { compileSets } from './compile/compile-sets';
export type { SetBakeInput } from './compile/compile-sets';
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
export { codeInfoFor, encodableParams } from './codes/code-catalog';
export type { CodeInfo, CodeParamRange, CodeRisk, CodeScope } from './codes/code-catalog.types';
export { CODE_CATALOG } from './codes/code-catalog.data';
export { isGlyphName } from './codes/glyph';
export { structuralEntry, STRUCTURAL_IDS } from './codes/structural-entries';
export type { StructuralEntry } from './codes/structural-entries';
export {
  buildVariableIndex, builtinVariables, findHardcoded, legacyFromVariables, mergeVariableMeta,
  resolve, scanRun, variablesFromLegacy,
} from './variables';
export type {
  LegacyNameData, Occurrence, ResolveOptions, Variable, VariableIndex, VariableKind,
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
