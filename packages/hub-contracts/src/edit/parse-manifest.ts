/* @layer shared-storage @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';
import { isManifest } from './is-manifest';

const parseManifest = (text: string | null): MsuPackManifest | null => {
  if (text == null) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    return isManifest(parsed) ? parsed : null;
  } catch { return null; }
};

export { parseManifest };
