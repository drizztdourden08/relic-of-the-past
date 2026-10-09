/* @layer shared-storage @kind logic */
import { savesDir } from './saves-dir';

const quickDir = (profile: string): string => `${savesDir(profile)}/quick`;

export { quickDir };
