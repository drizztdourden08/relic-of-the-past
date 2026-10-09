/* @layer renderer-lib @kind logic */
import type { HudLayout } from '@shared/types/hud';
import { readCustomLayouts } from './read-custom-layouts';
import { writeCustomLayouts } from './write-custom-layouts';

const saveCustomLayout = async (doc: HudLayout): Promise<HudLayout> => {
  const saved: HudLayout = { ...doc, builtIn: false };
  const { documents } = await readCustomLayouts();
  const index = documents.findIndex((existing) => existing.id === saved.id);
  await writeCustomLayouts(index >= 0
    ? documents.map((existing, at) => (at === index ? saved : existing))
    : [...documents, saved]);
  return saved;
};

export { saveCustomLayout };
