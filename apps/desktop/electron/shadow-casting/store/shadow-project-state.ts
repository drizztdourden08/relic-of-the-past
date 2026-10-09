/* @layer electron-main @kind logic */
import type { ShadowCastingProject } from '@shared/types/shadow-casting';

const shadowProjectState = { cachedProject: null as ShadowCastingProject | null };

export { shadowProjectState };
