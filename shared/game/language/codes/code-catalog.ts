/* @layer shared-game @kind logic */
/**
 * Lookup + real-limit derivation over the control-code catalog (data in
 * `code-catalog.data.ts`). Two different notions of "range" are involved:
 * `CodeInfo.param` is a fixed, language-independent display hint, while
 * `encodableParams` below computes what a *specific* language can actually
 * bake, straight from the encoders in `dialogue-encoder.ts`.
 */
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import { kCmdInfo } from '@shared/asset-extraction/text/dialogue-encoder';
import type { CodeInfo } from './code-catalog.types';
import { CODE_CATALOG } from './code-catalog.data';

const CATALOG_BY_NAME = new Map(CODE_CATALOG.map((info) => [info.name, info]));

/** The full byte range a raw `org`-encoder param slot accepts (no further validation exists). */
const ORG_PARAM_RANGE = Array.from({ length: 256 }, (_, value) => value);

const codeInfoFor = (name: string): CodeInfo | null => CATALOG_BY_NAME.get(name) ?? null;

/**
 * The `org` encoder (`orgEncoder` in dialogue-encoder.ts) writes any param
 * byte verbatim once the command occupies a two-byte slot in the language's
 * own `commandNames`/`commandLengths` — there is no narrower validation.
 */
const orgEncodableParams = (name: string, cfg: LanguageConfig): number[] | null => {
  const index = cfg.commandNames.indexOf(name);
  if (index < 0 || cfg.commandLengths[index] !== 2) return null;
  return ORG_PARAM_RANGE;
};

/**
 * The `new` encoder (`newEncoder`) never consults the language config at
 * all — it looks `name` up in the global `kCmdInfo` table, whose per-param
 * map can map a value to `null` (present but not actually encodable, e.g.
 * `Window`'s 0, or `ScrollSpd`'s 0). Those are filtered out.
 */
const newEncodableParams = (name: string): number[] | null => {
  const info = kCmdInfo[name];
  if (!info || info.length <= 1 || typeof info[1] === 'number') return null;
  const paramMap = info[1] as Record<number, number | null>;
  return Object.keys(paramMap).map(Number).filter((value) => paramMap[value] !== null);
};

const encodableParams = (name: string, cfg: LanguageConfig): number[] | null => (
  cfg.encoder === 'org' ? orgEncodableParams(name, cfg) : newEncodableParams(name)
);

export { codeInfoFor, encodableParams };
