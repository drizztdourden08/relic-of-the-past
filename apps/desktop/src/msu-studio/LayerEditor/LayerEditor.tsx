/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button, EmptyState, SectionHeader, Text } from '@drizztdourden08/tessera/primitives';
import { useLayerEditor } from './behavior/useLayerEditor';
import { LayerCard } from './sub-components/LayerCard';
import { LayerEditorFooter } from './sub-components/LayerEditorFooter';
import { useFileLoopSamples } from './behavior/useFileLoopSamples';
import { LayerLive } from '../PreviewReadout';
import './LayerEditor.css';
import type { LayerEditorProps } from './LayerEditor.type';

const LayerEditor = (props: LayerEditorProps) => {
  const {
    pack, target, manifest, saveBase, availableFiles, isLayered, reportStore, onConfirm, onSaved,
    readOnly = false,
  } = props;
  const {
    layers, dirty, saving, error, addLayer, removeLayer, moveLayer, updateLayer, save, revert,
  } = useLayerEditor({ pack, target, manifest, saveBase, onSaved });
  const t = useT();
  const locked = saving || readOnly;
  const fileLoopSamples = useFileLoopSamples(
    pack, [...new Set(layers.map((layer) => layer.files[0]).filter((name) => name !== undefined))],
  );

  return (
    <Box className="layer-editor">
      <SectionHeader
        title={t('msu-studio:layers.title', { target: target.label })}
        subtitle={isLayered || readOnly ? undefined : t('msu-studio:layers.subtitle.no-manifest')}
        action={
          <Button variant="secondary" size="sm" disabled={locked} onClick={addLayer}>{t('msu-studio:layers.add')}</Button>
        }
      />

      {layers.length === 0 ? (
        <EmptyState message={t('msu-studio:layers.empty')} />
      ) : (
        layers.map((layer, index) => (
          <LayerCard
            key={layer.id}
            layer={layer}
            index={index}
            total={layers.length}
            available={availableFiles}
            fileLoopSample={fileLoopSamples.get(layer.files[0] ?? '') ?? null}
            disabled={locked}
            live={<LayerLive store={reportStore} previewKey={target.previewKey} layerId={layer.id} />}
            onConfirm={onConfirm}
            onChange={(patch) => updateLayer(layer.id, patch)}
            onMove={(delta) => moveLayer(layer.id, delta)}
            onRemove={() => removeLayer(layer.id)}
          />
        ))
      )}

      {error != null && <Text className="layer-editor__error">{error}</Text>}

      <LayerEditorFooter locked={locked} dirty={dirty} saving={saving} onSave={() => void save()} onRevert={revert} />
    </Box>
  );
};

export { LayerEditor };
