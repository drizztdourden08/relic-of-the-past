/* @layer renderer-components @kind component */
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
  const locked = saving || readOnly;
  const fileLoopSamples = useFileLoopSamples(
    pack, [...new Set(layers.map((layer) => layer.files[0]).filter((name) => name !== undefined))],
  );

  return (
    <Box className="layer-editor">
      <SectionHeader
        title={`Layers - ${target.label}`}
        subtitle={isLayered || readOnly ? undefined : 'This pack has no manifest yet. Saving writes one.'}
        action={
          <Button variant="secondary" size="sm" disabled={locked} onClick={addLayer}>Add layer</Button>
        }
      />

      {layers.length === 0 ? (
        <EmptyState message="No layers yet." />
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
