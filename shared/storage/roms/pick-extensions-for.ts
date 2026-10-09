/* @layer shared-storage @kind logic */
import { ROM_KINDS } from '../rom-kinds';
import type { RomKind } from '../rom-kinds';

const pickExtensionsFor = (kind: RomKind): readonly string[] => ROM_KINDS[kind].pickExtensions;

export { pickExtensionsFor };
