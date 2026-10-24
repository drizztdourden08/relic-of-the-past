/* @layer renderer-lib @kind constants */
import { WORLD_MODULE_NAME } from '@rotp/randomizer';

const BUILDS_INDEX_PATH = 'archipelago/builds.json';

const buildPathOf = (apVersion: string): string => `archipelago/${apVersion}/${WORLD_MODULE_NAME}.apworld`;

export { BUILDS_INDEX_PATH, buildPathOf };
