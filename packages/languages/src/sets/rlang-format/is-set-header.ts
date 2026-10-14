/* @layer shared-storage @kind logic */
import { kLanguages } from '@rotp/asset-extraction';
import { SET_FORMAT } from '../format-2';
import type { SetHeader } from './rlang-format.type';

const hasIdentity = (header: Record<string, unknown>): boolean =>
  typeof header.id === 'string' && typeof header.name === 'string' && header.name.length > 0
  && typeof header.base === 'string' && Object.hasOwn(kLanguages, header.base);

const hasOriginAndVersion = (header: Record<string, unknown>): boolean =>
  (header.origin === 'rom' || header.origin === 'custom') && typeof header.version === 'number';

const hasSupportedFormat = (header: Record<string, unknown>): boolean =>
  header.format === undefined || (typeof header.format === 'number' && header.format <= SET_FORMAT);

const isSetHeader = (value: unknown): value is SetHeader => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const header = value as Record<string, unknown>;
  return hasIdentity(header) && hasOriginAndVersion(header) && hasSupportedFormat(header);
};

export { isSetHeader };
