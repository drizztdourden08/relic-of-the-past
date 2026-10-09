/* @layer renderer-lib @kind logic */
import type { GlyphPack } from '@shared/types/hud';
import { readCustomPacks } from './read-custom-packs';
import { writeCustomPacks } from './write-custom-packs';

const upsertPack = async (pack: GlyphPack): Promise<GlyphPack> => {
  const existing = await readCustomPacks();
  const index = existing.findIndex((p) => p.id === pack.id);
  const next = index >= 0 ? existing.map((p, i) => (i === index ? pack : p)) : [...existing, pack];
  await writeCustomPacks(next);
  return pack;
};

export { upsertPack };
