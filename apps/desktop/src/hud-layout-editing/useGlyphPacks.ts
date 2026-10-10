/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BUILT_IN_GLYPH_PACKS } from '@rotp/input-mapping';
import {
  createCustomPack, deleteCustomPack, importGlyphImage, primeGlyphUrls, readCustomPacks, removeGlyphImage,
} from '@app/hud/custom-glyph-store';
import type { GlyphPosition } from '@app/hud/custom-glyph-store';
import type { GlyphPack } from '@rotp/input-mapping';
import type { GlyphPacks } from './glyph-packs.type';

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

  const packs = useMemo(() => [...BUILT_IN_GLYPH_PACKS, ...custom], [custom]);

  return { packs, custom, version, busy, createPack, deletePack, importImage, removeImage };
};

export { useGlyphPacks };
export type { GlyphPacks } from './glyph-packs.type';
