/* @layer shared-storage @kind logic */
import { MSUL_MANIFEST_NAME } from '@shared/types/msu-manifest';

const isInventoryName = (name: string): boolean => name !== MSUL_MANIFEST_NAME;

export { isInventoryName };
