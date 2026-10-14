/* @layer renderer-lib @kind logic */
import type { SpriteDef } from '@rotp/asset-extraction';
import type { SPRITE_DEFINITIONS } from '@rotp/game-data';

const isExtractDef = (value: unknown): value is SpriteDef['extract'] =>
  typeof value === 'object' && value !== null && 'method' in value && typeof value.method === 'string';

const toSpriteDefs = (definitions: typeof SPRITE_DEFINITIONS): SpriteDef[] =>
  definitions.flatMap((def) => (isExtractDef(def.extract) ? [{ ...def, extract: def.extract }] : []));

export { toSpriteDefs };
