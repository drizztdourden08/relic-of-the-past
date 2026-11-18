/* @layer renderer-lib @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { isZspr, parseRsp, isRspName, library } from '@rotp/packs';
import { failureLine } from '../localized-error';
import { runImportJob } from '../import-job';
import { platformFiles } from '../platform-files';
import type { ImportResult } from './link-sprites-store.type';

const storeLinkSprite = async (name: string, bytes: Uint8Array): Promise<ImportResult> => {
  if (isRspName(name)) {
    if (!(await parseRsp(bytes))) return { success: false, error: msg('errors:sprite.unreadablePack') };
  } else if (!isZspr(bytes)) {
    return { success: false, error: msg('errors:sprite.invalidZspr') };
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
    failureOf: (result) => (result.success ? null : failureLine(result.error ?? 'Import failed')),
  });

export { importLinkSprite };
