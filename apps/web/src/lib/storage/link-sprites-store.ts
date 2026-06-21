/* @layer renderer-lib @kind logic */
/**
 * Renderer store for custom Link sprites. A global, profile-independent library of .zspr files under
 * `link-sprites/` in the FileStore (appData on desktop). A profile's `linkSprite` setting selects one;
 * the bridge writes the chosen file to MEMFS at boot. Validation rejects anything that isn't a real ZSPR.
 */
import { getPlatform } from '@app/platform/get-platform';
import { isZspr } from '@app/lib/game/zspr';

const files = () => getPlatform().files;
const DIR = 'link-sprites';
const ZSPR_RE = /\.zspr$/i;

const listLinkSprites = async (): Promise<string[]> => {
  const all = await files().list(DIR);
  return all.filter((f) => ZSPR_RE.test(f)).sort((a, b) => a.localeCompare(b));
};

const importLinkSprite = async (name: string, bytes: Uint8Array): Promise<{ success: boolean; name?: string; error?: string }> => {
  if (!isZspr(bytes)) return { success: false, error: 'Not a valid ZSPR sprite file.' };
  const base = name.replace(/\.zspr$/i, '').replace(/[^\w.-]+/g, '_') || 'sprite';
  const safe = `${base}.zspr`;
  await files().writeBytes(`${DIR}/${safe}`, bytes);
  return { success: true, name: safe };
};

const deleteLinkSprite = (name: string): Promise<void> => files().remove(`${DIR}/${name}`);

const readLinkSprite = (name: string): Promise<Uint8Array | null> => files().readBytes(`${DIR}/${name}`);

export { listLinkSprites, importLinkSprite, deleteLinkSprite, readLinkSprite };
