/* @layer shared-storage @kind logic */
import { ROM_KIND_LIST } from './rom-kinds.constants';
import type { RomKind } from './rom-kinds.type';

const kindOfFile = (fileName: string): RomKind | null =>
  ROM_KIND_LIST.find((spec) => spec.pattern.test(fileName))?.kind ?? null;

export { kindOfFile };
