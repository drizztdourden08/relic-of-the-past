/* @layer renderer-lib @kind logic */
/**
 * Renderer store for custom player sprites: the shared library in
 * shared/storage/link-sprites, bound to this host's FileStore.
 *
 * Validation is per-container: a ZSPR by its magic, a pack by being a readable zip
 * with a manifest, so a mislabelled file is rejected on import instead of at boot.
 */
import { getPlatform } from '@app/platform/get-platform';
import { isZspr } from '@app/lib/game/zspr';
import { parseRsp, isRspName } from '@shared/storage/link-sprites/parse-rsp';
import * as library from '@shared/storage/link-sprites/link-sprites';

const files = () => getPlatform().files;

const listLinkSprites = (): Promise<string[]> => library.listLinkSprites(files());

interface ImportResult {
  success: boolean;
  name?: string;
  error?: string;
}

const importLinkSprite = async (name: string, bytes: Uint8Array): Promise<ImportResult> => {
  if (isRspName(name)) {
    if (!(await parseRsp(bytes))) return { success: false, error: 'Not a readable sprite pack.' };
  } else if (!isZspr(bytes)) {
    return { success: false, error: 'Not a valid ZSPR sprite file.' };
  }
  const safe = library.safeFileName(name);
  await library.writeLinkSprite(files(), safe, bytes);
  return { success: true, name: safe };
};

/** Overwrite in place, for the studio's save. Skips the rename import applies. */
const writeLinkSprite = (name: string, bytes: Uint8Array): Promise<void> =>
  library.writeLinkSprite(files(), name, bytes);

const deleteLinkSprite = (name: string): Promise<void> => library.deleteLinkSprite(files(), name);

const readLinkSprite = (name: string): Promise<Uint8Array | null> => library.readLinkSprite(files(), name);

export { listLinkSprites, importLinkSprite, writeLinkSprite, deleteLinkSprite, readLinkSprite };
export type { ImportResult };
