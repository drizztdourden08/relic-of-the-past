/* @layer shared-game @kind logic */
import type { LanguageConfig } from '@rotp/asset-extraction';
import { kCmdInfo } from '@rotp/asset-extraction';
import { ORG_PARAM_RANGE, ORG_PARAM_SLOT_BYTES } from './code-catalog.constants';

const orgEncodableParams = (name: string, cfg: LanguageConfig): number[] | null => {
  const index = cfg.commandNames.indexOf(name);
  if (index < 0 || cfg.commandLengths[index] !== ORG_PARAM_SLOT_BYTES) return null;
  return ORG_PARAM_RANGE;
};

const newEncodableParams = (name: string): number[] | null => {
  const info = kCmdInfo[name];
  if (!info || info.length <= 1 || typeof info[1] === 'number') return null;
  const paramMap = info[1] as Record<number, number | null>;
  return Object.keys(paramMap).map(Number).filter((value) => paramMap[value] !== null);
};

const encodableParams = (name: string, cfg: LanguageConfig): number[] | null => (
  cfg.encoder === 'org' ? orgEncodableParams(name, cfg) : newEncodableParams(name)
);

export { encodableParams };
