/* @layer renderer-lib @kind logic */
import { isZspr } from '@rotp/packs';
import { parseRsp, isRspName } from '@rotp/packs';
import { library } from '@rotp/packs';
import { platformFiles } from '../platform-files';
import type { ImportResult } from './link-sprites-store.type';

const importLinkSprite = async (name: string, bytes: Uint8Array): Promise<ImportResult> => {
  if (isRspName(name)) {
    if (!(await parseRsp(bytes))) return { success: false, error: 'Not a readable sprite pack.' };
  } else if (!isZspr(bytes)) {
    return { success: false, error: 'Not a valid ZSPR sprite file.' };
  }
  const safe = library.safeFileName(name);
  await library.writeLinkSprite(platformFiles(), safe, bytes);
  return { success: true, name: safe };
};

export { importLinkSprite };
