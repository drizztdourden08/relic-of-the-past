/* @layer renderer-components @kind logic */
import { codeInfoFor, encodableParams } from '@rotp/languages';
import type { LanguageConfig } from '@rotp/asset-extraction';

const paramValuesFor = (name: string, cfg: LanguageConfig): number[] | null => {
  const encodable = encodableParams(name, cfg);
  if (!encodable) return null;
  const range = codeInfoFor(name)?.param;
  return range
    ? encodable.filter((value) => value >= range.min && value <= range.max)
    : encodable;
};

export { paramValuesFor };
