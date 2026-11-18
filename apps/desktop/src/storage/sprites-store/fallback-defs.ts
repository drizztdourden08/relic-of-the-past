/* @layer renderer-lib @kind logic */
import type { SpriteDef } from '@rotp/asset-extraction';
import { SPRITE_DEFS } from './sprites-store.constants';

const fallbackDefs = (errors: string[]): { failed: Set<string>; defs: SpriteDef[] } => {
  const failed = new Set(SPRITE_DEFS.filter((def) => errors.some((error) => error.startsWith(`${def.file}:`))).map((def) => def.file));
  const bases = new Set(SPRITE_DEFS.flatMap((def) => (failed.has(def.file) && def.extract.baseFile ? [def.extract.baseFile] : [])));
  return { failed, defs: SPRITE_DEFS.filter((def) => failed.has(def.file) || bases.has(def.file)) };
};

export { fallbackDefs };
