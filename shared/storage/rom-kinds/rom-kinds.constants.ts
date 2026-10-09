/* @layer shared-storage @kind constants */
import { ROM_KINDS } from './rom-kinds.data';
import type { RomKindSpec } from './rom-kinds.type';

const ROM_KIND_LIST: RomKindSpec[] = Object.values(ROM_KINDS);

export { ROM_KIND_LIST };
