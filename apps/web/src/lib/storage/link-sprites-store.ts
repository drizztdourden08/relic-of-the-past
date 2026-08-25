/* @layer renderer-lib @kind logic */
/**
 * Renderer store for custom player sprites. A global, profile-independent library under
 * `link-sprites/` in the FileStore (appData on desktop). A profile's `linkSprite` setting
 * selects one; the bridge stages the chosen file for the core at boot.
 *
 * Two containers live here side by side: `.zspr`, which other tools produce, and `.rsp`,
 * ours. Validation is per-container — a ZSPR by its magic, a pack by being a readable zip
 * with a manifest — so a mislabelled file is rejected on import rather than at boot.
 */
import { getPlatform } from '@app/platform/get-platform';
import { isZspr } from '@app/lib/game/zspr';
import { parseRsp, isRspName } from '@app/lib/game/rsp';

const files = () => getPlatform().files;
const DIR = 'link-sprites';
const SPRITE_RE = /\.(zspr|rsp)$/i;

const listLinkSprites = async (): Promise<string[]> => {
  const all = await files().list(DIR);
  return all.filter((f) => SPRITE_RE.test(f)).sort((a, b) => a.localeCompare(b));
};

/** Strips the container extension — what the UI shows as the sprite's name. */
const spriteStem = (name: string): string => name.replace(SPRITE_RE, '');

const safeFileName = (name: string): string => {
  const ext = isRspName(name) ? 'rsp' : 'zspr';
  const base = spriteStem(name).replace(/[^\w.-]+/g, '_') || 'sprite';
  return `${base}.${ext}`;
};

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
  const safe = safeFileName(name);
  await files().writeBytes(`${DIR}/${safe}`, bytes);
  return { success: true, name: safe };
};

/** Overwrite in place, for the studio's save. Skips the rename import applies. */
const writeLinkSprite = (name: string, bytes: Uint8Array): Promise<void> =>
  files().writeBytes(`${DIR}/${name}`, bytes);

const deleteLinkSprite = (name: string): Promise<void> => files().remove(`${DIR}/${name}`);

const readLinkSprite = (name: string): Promise<Uint8Array | null> => files().readBytes(`${DIR}/${name}`);

export { listLinkSprites, importLinkSprite, writeLinkSprite, deleteLinkSprite, readLinkSprite, spriteStem, safeFileName };
export type { ImportResult };
