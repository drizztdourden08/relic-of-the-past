/* @layer shared-storage @kind logic */
/**
 * The `.rlang` container: one language set as a plain ZIP. `set.json` is entry 0, so a reader
 * can identify a set from the head of the file, then the set's payload files follow in a fixed
 * order. Only the files a set folder is made of travel; the ROM-extraction leftovers
 * (`dialogue.txt`, `meta.json`) never do.
 */
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import type { LanguageSetMeta } from '@shared/game/language';
import { SET_FORMAT } from './format-2';
import { SET_FILES } from './paths';

const RLANG_EXTENSION = 'rlang';
const RLANG_HEADER_ENTRY = SET_FILES.meta;

/** Files every set needs to open and bake. */
const REQUIRED_PAYLOAD: readonly string[] = [SET_FILES.dialogue, SET_FILES.font, SET_FILES.fontWidth];

/** Payload files of a set whose header declares `format`, in archive order. */
const payloadNames = (format: number): string[] => [
  SET_FILES.dialogue,
  SET_FILES.text,
  ...(format >= SET_FORMAT ? [SET_FILES.variables] : [SET_FILES.glossary, SET_FILES.names]),
  SET_FILES.font,
  SET_FILES.fontWidth,
];

/** Every payload name either format may carry: what an import accepts from an archive. */
const ACCEPTED_PAYLOAD: ReadonlySet<string> = new Set([...payloadNames(1), ...payloadNames(SET_FORMAT)]);

/** The header as a set folder stores it: identity plus the format bookkeeping. */
type SetHeader = LanguageSetMeta & { format?: number; structure?: string } & Record<string, unknown>;

/** A header this build can open: named, from a base language it knows, of a known origin. */
const isSetHeader = (value: unknown): value is SetHeader => {
  const header = value as SetHeader | null;
  return !!header && typeof header === 'object' && !Array.isArray(header)
    && typeof header.id === 'string' && typeof header.name === 'string' && header.name.length > 0
    && typeof header.base === 'string' && Object.hasOwn(kLanguages, header.base)
    && (header.origin === 'rom' || header.origin === 'custom')
    && typeof header.version === 'number'
    && (header.format === undefined || (typeof header.format === 'number' && header.format <= SET_FORMAT));
};

export { RLANG_EXTENSION, RLANG_HEADER_ENTRY, REQUIRED_PAYLOAD, ACCEPTED_PAYLOAD, payloadNames, isSetHeader };
export type { SetHeader };
