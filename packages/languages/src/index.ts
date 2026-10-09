/* @layer package @kind barrel */
export { readLanguageSets } from './assets/read-language-sets';
export { defaultPauseNames } from './data/pause-names';
export { MAX_NAME_GLYPHS, ROWS_PER_BOX, ROW_WIDTH_PX, STRUCTURE_MODES, advanceForNewLine, buildGroups, buildVariableIndex, codeInfoFor, compileSets, encodableParams, findHardcoded, glyphIndexOf, isGlyphName, joinLines, layoutPlan, lineMetrics, measureRows, mergeVariableMeta, resolve, resolveInherited, serializeTokens, splitBlocks, splitLines, splitScreens, structuralEntry, validateEntry, variablesFromNameTables, widthOf } from './messages';
export type { Block, BlockDoc, DecodedLine, DialogueEntry, DialogueLineView, EntryIssue, GlossaryTerm, GlyphMetrics, GlyphSheet, LanguageSet, LayoutOptions, LineAdvance, NameTable, Occurrence, PauseLabelKey, RowFit, SetBakeInput, SetStructure, StructureMode, TextGroup, TextGroupId, TextLimit, TextSlot, Token, Variable, VariableIndex, VariableKind } from './messages';
export type { ScreenFit } from './messages/layout/types';
export { breakLine } from './messages/structure';
export { ENGINE_SAMPLES, NUMBER_KEY, PLAYER_NAME_KEY } from './messages/variables';
export * as languages from './sets';
export { RLANG_EXTENSION, createSet, duplicateSet, getSet, list, saveSet } from './sets';
export type { CreateSetParams, ExtractedPack, LanguageSetSummary, SetFontBytes } from './sets';
export { setDir } from './sets/paths';
export { readRlangBytes } from './sets/read-rlang-bytes';
export { assertValidSetId, pickFreeSetId } from './sets/set-id';
export { rlangInstaller } from './store/install/install-rlang';
export { factsFor } from './store/manifest/facts-for';
