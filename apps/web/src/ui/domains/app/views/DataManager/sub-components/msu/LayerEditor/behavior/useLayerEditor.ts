/* @layer renderer-components @kind hook */
/**
 * Holds the layer list being edited and writes it back to `pack.json`.
 *
 * The draft is seeded once, on mount — the editor is mounted with a key of pack + target, so
 * switching slots or sounds gives a fresh draft and an in-progress edit is never overwritten by
 * a background reload of the pack.
 *
 * Reading and writing go through the target, so this hook is the same for a music slot and for
 * a claimed sound: only where the layers live differs, and that is the target's business.
 */
import { useCallback, useState } from 'react';
import type { MsuLayer, MsuPackManifest } from '@shared/types/msu-manifest';
import { writeMsuManifest } from '@app/lib/storage/msu-store';
import type { LayerTarget } from '../../behavior/layer-target';
import { createLayer, moveItem, normalizeLayers, validateLayers } from './layer-ops';

interface LayerEditorState {
  pack: string;
  /** Which layer list this is: how to read it out of the manifest, and how to write it back. */
  target: LayerTarget;
  /** Seeds the draft: the merged view, so a classic slot shows the layer it plays today. */
  manifest: MsuPackManifest;
  /** Written to disk — see LayerEditorProps.saveBase for why this is not the merged view. */
  saveBase: MsuPackManifest;
  onSaved: () => void;
}

const useLayerEditor = (params: LayerEditorState) => {
  const { pack, target, manifest, saveBase, onSaved } = params;
  const [layers, setLayers] = useState<MsuLayer[]>(() => target.read(manifest));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback((next: (current: MsuLayer[]) => MsuLayer[]) => {
    setLayers(next);
    setDirty(true);
    setError(null);
  }, []);

  const addLayer = useCallback(() => {
    mutate((current) => [...current, createLayer(current, target.oneShot)]);
  }, [mutate, target.oneShot]);

  const removeLayer = useCallback((id: string) => {
    mutate((current) => current.filter((layer) => layer.id !== id));
  }, [mutate]);

  const moveLayer = useCallback((id: string, delta: number) => {
    mutate((current) => moveItem(current, current.findIndex((layer) => layer.id === id), delta));
  }, [mutate]);

  const updateLayer = useCallback((id: string, patch: Partial<Omit<MsuLayer, 'id'>>) => {
    mutate((current) => current.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)));
  }, [mutate]);

  const save = useCallback(async () => {
    const problem = validateLayers(layers);
    if (problem) { setError(problem); return; }
    setSaving(true);
    setError(null);
    try {
      // Normalized on the way out only: the draft keeps the optional fields so the controls have
      // a value to render, while the file gets none it does not need.
      await writeMsuManifest(pack, target.write(saveBase, normalizeLayers(layers)));
      setDirty(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the layers');
    } finally {
      setSaving(false);
    }
  }, [layers, pack, saveBase, target, onSaved]);

  const revert = useCallback(() => {
    setLayers(target.read(manifest));
    setDirty(false);
    setError(null);
  }, [manifest, target]);

  return { layers, dirty, saving, error, addLayer, removeLayer, moveLayer, updateLayer, save, revert };
};

export { useLayerEditor };
export type { LayerEditorState };
