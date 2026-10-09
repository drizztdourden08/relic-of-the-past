/* @layer shared-storage @kind logic */
import { MSUL_MANIFEST_NAME } from '@shared/types/msu-manifest';
import { packDir } from '../msu-paths';

const manifestPath = (pack: string): string => `${packDir(pack)}/${MSUL_MANIFEST_NAME}`;

export { manifestPath };
