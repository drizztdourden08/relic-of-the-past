/* @layer shared-asset-extraction @kind logic */
import { readFileSync } from 'fs';
import { DEFAULT_DEFS_PATH } from './resolve-defs.constants';
import type { SpriteDef } from './extract-items';

const resolveDefs = (defsOrPath?: string | SpriteDef[]): SpriteDef[] => {
  if (Array.isArray(defsOrPath)) return defsOrPath;
  const path = defsOrPath ?? DEFAULT_DEFS_PATH;
  return (JSON.parse(readFileSync(path, 'utf-8')) as { sprites: SpriteDef[] }).sprites;
};

export { resolveDefs };
