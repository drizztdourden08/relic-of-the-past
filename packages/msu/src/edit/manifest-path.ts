/* @layer shared-storage @kind logic */
import { MSUL_MANIFEST_NAME } from '@rotp/hub-contracts';
import { packDir } from '../paths';

const manifestPath = (pack: string): string => `${packDir(pack)}/${MSUL_MANIFEST_NAME}`;

export { manifestPath };
