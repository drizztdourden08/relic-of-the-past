/* @layer renderer-lib @kind logic */
import { isZspr, parseRsp, isRspName, library } from '@rotp/packs';
import { runImportJob } from '../import-job';
import { platformFiles } from '../platform-files';
import type { ImportResult } from './link-sprites-store.type';

const storeLinkSprite = async (name: string, bytes: Uint8Array): Promise<ImportResult> => {
  if (isRspName(name)) {
    if (!(await parseRsp(bytes))) return { success: false, error: 'Not a readable sprite pack.' };
  } else if (!isZspr(bytes)) {
    return { success: false, error: 'Not a valid ZSPR sprite file.' };
  }
  const safe = library.safeFileName(name);
  await library.writeLinkSprite(platformFiles(), safe, bytes);
  return { success: true, name: safe };
};

const importLinkSprite = (name: string, bytes: Uint8Array): Promise<ImportResult> =>
  runImportJob({
    kind: 'linkSprite',
    title: 'Adding a player sprite',
    work: () => storeLinkSprite(name, bytes),
    failureOf: (result) => (result.success ? null : (result.error ?? 'Import failed')),
  });

export { importLinkSprite };
