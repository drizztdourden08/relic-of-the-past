/* @layer shared-storage @kind logic */
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import { SET_FORMAT } from '../format-2';
import type { SetHeader } from './rlang-format.type';

const isSetHeader = (value: unknown): value is SetHeader => {
  const header = value as SetHeader | null;
  return !!header && typeof header === 'object' && !Array.isArray(header)
    && typeof header.id === 'string' && typeof header.name === 'string' && header.name.length > 0
    && typeof header.base === 'string' && Object.hasOwn(kLanguages, header.base)
    && (header.origin === 'rom' || header.origin === 'custom')
    && typeof header.version === 'number'
    && (header.format === undefined || (typeof header.format === 'number' && header.format <= SET_FORMAT));
};

export { isSetHeader };
