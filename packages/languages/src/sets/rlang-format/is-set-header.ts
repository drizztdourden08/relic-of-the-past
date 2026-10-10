/* @layer shared-storage @kind logic */
import { kLanguages } from '@rotp/asset-extraction';
import { SET_FORMAT } from '../format-2';
import type { SetHeader } from './rlang-format.type';

const isSetHeader = (value: unknown): value is SetHeader => {
  if (typeof value !== 'object' || value === null) return false;
  const header = value as SetHeader;
  return !Array.isArray(header)
    && typeof header.id === 'string' && typeof header.name === 'string' && header.name.length > 0
    && typeof header.base === 'string' && Object.hasOwn(kLanguages, header.base)
    && (header.origin === 'rom' || header.origin === 'custom')
    && typeof header.version === 'number'
    && (header.format === undefined || (typeof header.format === 'number' && header.format <= SET_FORMAT));
};

export { isSetHeader };
