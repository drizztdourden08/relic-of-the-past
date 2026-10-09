/* @layer shared-asset-extraction @kind logic */
import type { SpriteExtractDef } from './extract-items.type';

const needField = <K extends keyof SpriteExtractDef>(
  def: SpriteExtractDef, key: K,
): NonNullable<SpriteExtractDef[K]> => {
  const value = def[key];
  if (value === undefined) {
    throw new Error(`Sprite def with method "${def.method}" has no "${key}"`);
  }
  return value;
};

export { needField };
