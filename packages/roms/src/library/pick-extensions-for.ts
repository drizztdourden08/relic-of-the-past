/* @layer shared-storage @kind logic */
import { ROM_KINDS } from '../kinds';
import type { RomKind } from '../kinds';

const pickExtensionsFor = (kind: RomKind): readonly string[] => ROM_KINDS[kind].pickExtensions;

export { pickExtensionsFor };
