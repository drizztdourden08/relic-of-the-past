/* @layer shared-storage @kind logic */
import { MSU_SIDECAR_SUFFIX } from './save-paths.constants';

const msuSidecarPath = (dir: string, stem: string): string => `${dir}/${stem}${MSU_SIDECAR_SUFFIX}`;

export { msuSidecarPath };
