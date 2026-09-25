/* @layer renderer-components @kind hook */
/**
 * Every glyph pack the editor can offer, and the operations that change the
 * player's own.
 *
 * Custom packs are loaded alongside the shipped ones and handed to the glyph
 * chain as one list, so a custom pack behaves exactly like a built-in: it is
 * consulted first, and anything it does not cover falls through to the pack it
 * names and then to the device's own family. The images are primed into the
 * object-URL cache as soon as the packs are read, because a render pass needs
 * that lookup to be synchronous.
 *
 * `version` bumps whenever an image is added or dropped. The pack object alone
 * cannot say that, since a re-import over the same position keeps the same file
 * key, so `version` is what tells the preview to draw again.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BUILT_IN_GLYPH_PACKS } from '@shared/input/glyphs';
import {
  createCustomPack, deleteCustomPack, importGlyphImage, primeGlyphUrls, readCustomPacks, removeGlyphImage,
} from '@app/lib/hud/custom-glyph-store';
import type { GlyphPosition } from '@app/lib/hud/custom-glyph-store';
import type { GlyphPack } from '@shared/types/hud';

interface GlyphPacks {
  /** Shipped packs first, then the player's own. This is the whole chain's input. */
  packs: readonly GlyphPack[];
  custom: readonly GlyphPack[];
  version: number;
  busy: boolean;
  createPack: (name: string) => Promise<GlyphPack | null>;
  deletePack: (packId: string) => Promise<void>;
  importImage: (packId: string, position: GlyphPosition, file: File) => Promise<void>;
  removeImage: (packId: string, position: GlyphPosition) => Promise<void>;
}

const useGlyphPacks = (): GlyphPacks => {
  const [custom, setCustom] = useState<readonly GlyphPack[]>([]);
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(true);

  const refresh = useCallback(async () => {
    const packs = await readCustomPacks();
    await primeGlyphUrls(packs);
    setCustom(packs);
    setVersion((v) => v + 1);
    setBusy(false);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const createPack = useCallback(async (name: string) => {
    setBusy(true);
    const pack = await createCustomPack(name);
    await refresh();
    return pack;
  }, [refresh]);

  const deletePack = useCallback(async (packId: string) => {
    setBusy(true);
    await deleteCustomPack(packId);
    await refresh();
  }, [refresh]);

  const importImage = useCallback(async (packId: string, position: GlyphPosition, file: File) => {
    setBusy(true);
    await importGlyphImage(packId, position, file.name, new Uint8Array(await file.arrayBuffer()));
    await refresh();
  }, [refresh]);

  const removeImage = useCallback(async (packId: string, position: GlyphPosition) => {
    setBusy(true);
    await removeGlyphImage(packId, position);
    await refresh();
  }, [refresh]);

  // One stable array per set of custom packs: the preview memoizes on it, and a
  // fresh array every render would defeat that.
  const packs = useMemo(() => [...BUILT_IN_GLYPH_PACKS, ...custom], [custom]);

  return { packs, custom, version, busy, createPack, deletePack, importImage, removeImage };
};

export { useGlyphPacks };
export type { GlyphPacks };
