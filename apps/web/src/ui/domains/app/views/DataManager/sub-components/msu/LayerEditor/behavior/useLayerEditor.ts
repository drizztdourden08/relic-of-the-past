/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import type { MsuLayer } from '@shared/types/msu-manifest';
import { writeMsuManifest } from '@app/lib/storage/msu-store';
import { createLayer, moveItem, normalizeLayers, validateLayers } from './layer-ops';
import type { LayerEditorState } from './useLayerEditor.type';

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
