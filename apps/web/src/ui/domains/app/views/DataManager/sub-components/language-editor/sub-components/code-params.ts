/* @layer renderer-components @kind logic */
/**
 * The parameter values a picker may offer for one control code.
 *
 * Two different limits have to agree before a value is safe to show. What the
 * language can actually bake comes from `encodableParams`; what a translator
 * can reason about comes from the catalog's documented practical range. The raw
 * `org` encoder accepts any of 256 bytes, which is a byte editor, not a
 * menu, so the catalog range narrows it whenever the catalog publishes one.
 *
 * `null` means the code takes no parameter at all, so the insert is one click.
 */
import { codeInfoFor, encodableParams } from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';

const paramValuesFor = (name: string, cfg: LanguageConfig): number[] | null => {
  const encodable = encodableParams(name, cfg);
  if (!encodable) return null;
  const range = codeInfoFor(name)?.param;
  return range
    ? encodable.filter((value) => value >= range.min && value <= range.max)
    : encodable;
};

export { paramValuesFor };
