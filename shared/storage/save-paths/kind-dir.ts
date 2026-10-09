/* @layer shared-storage @kind logic */
import type { SaveKind } from './save-paths.type';
import { savesDir } from './saves-dir';

const kindDir = (profile: string, kind: SaveKind): string => `${savesDir(profile)}/${kind}`;

export { kindDir };
