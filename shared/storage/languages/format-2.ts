/* @layer shared-storage @kind logic */
/**
 * Format 2 of a stored language set: one `variables.json` in place of the
 * `glossary.json` + `names.json` pair, plus a `structure` choice, both
 * discriminated by a `format` number in the set header.
 *
 * UPGRADE ON READ. A folder written before this format has no `format` field,
 * so it is read as 1: the old pair is loaded and folded into one variable list.
 * Nothing is written at that point, and the old files are never deleted — the
 * next save simply writes format 2, and a leftover `glossary.json` can never be
 * misread because the header says which payload counts. Idempotent by
 * construction: reading a folder that already says 2 skips the fold entirely.
 *
 * REBUILD ON WRITE. The set is still edited through its projected glossary and
 * name table (that projection is what the pause menu, the bake step and the
 * editor's tables read), so the variable list is rebuilt from the pair on every
 * save and the previous list is merged back in for the fields the pair cannot
 * carry. That keeps one direction of truth per operation and makes a
 * read-write-read cycle produce byte-identical files.
 *
 * UNKNOWN FIELDS SURVIVE. The header is read back before it is rewritten and
 * the known keys are overlaid on it, so a field written by a newer build (or by
 * another part of the app) is preserved rather than dropped.
 */
import type { FileStore } from '@shared/platform';
import type {
  GlossaryTerm, LanguageSet, NameTable, SetStructure, Variable,
} from '@shared/game/language';
import { emptyNameTable, legacyFromVariables, mergeVariableMeta, variablesFromLegacy } from '@shared/game/language';
import { readJson, writeJson } from '../json';
import { glossaryPath, namesPath, setMetaPath, variablesPath } from './paths';

/** Format this build writes. A folder with no `format` field is format 1. */
const SET_FORMAT = 2;

const DEFAULT_STRUCTURE: SetStructure = 'continuous';

/** The content half of a set: the one list, its layout mode, and its projection. */
type SetContent = {
  variables: Variable[];
  structure: SetStructure;
  glossary: GlossaryTerm[];
  names: NameTable;
};

const kStructures: SetStructure[] = ['continuous', 'block', 'off'];

/** An unrecognised or absent value falls back rather than failing a read. */
const asStructure = (value: unknown): SetStructure => (
  kStructures.includes(value as SetStructure) ? value as SetStructure : DEFAULT_STRUCTURE
);

const readHeader = (files: FileStore, id: string): Promise<Record<string, unknown>> =>
  readJson<Record<string, unknown>>(files, setMetaPath(id), {});

const formatOf = (header: Record<string, unknown>): number => (
  typeof header.format === 'number' ? header.format : 1
);

const readLegacyVariables = async (files: FileStore, id: string): Promise<Variable[]> =>
  variablesFromLegacy(
    await readJson<GlossaryTerm[]>(files, glossaryPath(id), []),
    await readJson<NameTable>(files, namesPath(id), emptyNameTable()),
  );

/** The set's content, upgraded from format 1 in memory when that is what is there. */
const readContent = async (files: FileStore, id: string): Promise<SetContent> => {
  const header = await readHeader(files, id);
  const variables = formatOf(header) >= SET_FORMAT
    ? await readJson<Variable[]>(files, variablesPath(id), [])
    : await readLegacyVariables(files, id);

  return { variables, structure: asStructure(header.structure), ...legacyFromVariables(variables) };
};

/** The list to persist: rebuilt from the projection, with the old metadata kept. */
const variablesOf = (set: LanguageSet): Variable[] =>
  mergeVariableMeta(variablesFromLegacy(set.glossary, set.names), set.variables);

const writeHeader = async (files: FileStore, set: LanguageSet): Promise<void> => {
  const { id, name, base, origin, version, author } = set;
  const previous = await readHeader(files, id);
  await writeJson(files, setMetaPath(id), {
    ...previous,
    id,
    name,
    base,
    origin,
    version,
    author,
    format: SET_FORMAT,
    structure: asStructure(set.structure),
  });
};

/** Header plus variable payload — everything format 2 owns. */
const writeContent = async (files: FileStore, set: LanguageSet): Promise<void> => {
  await writeHeader(files, set);
  await writeJson(files, variablesPath(set.id), variablesOf(set));
};

export { DEFAULT_STRUCTURE, readContent, SET_FORMAT, writeContent };
export type { SetContent };
