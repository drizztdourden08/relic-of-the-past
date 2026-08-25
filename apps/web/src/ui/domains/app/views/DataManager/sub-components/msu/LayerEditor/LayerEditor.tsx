/* @layer renderer-components @kind component */
/**
 * Edits one slot's layers and writes them to the pack's manifest.
 *
 * Saving a pack that has no manifest yet writes one for the WHOLE pack, not just this slot: the
 * draft is seeded from the synthesized single-layer view, so the other slots are preserved
 * exactly as they played before. That is the moment a classic pack becomes a layered one, and
 * the notice below says so before the user commits to it.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { ButtonRow } from '@ds/primitives/ButtonRow';
import { EmptyState } from '@ds/primitives/EmptyState';
import { SectionHeader } from '@ds/primitives/SectionHeader';
import { Text } from '@ds/primitives/Text';
import { useLayerEditor } from './behavior/useLayerEditor';
import { LayerCard } from './sub-components/LayerCard';
import { useFileLoopSamples } from './behavior/useFileLoopSamples';
import { LayerLive } from '../PreviewReadout';
import './LayerEditor.css';
import type { LayerEditorProps } from './LayerEditor.type';

const LayerEditor = (props: LayerEditorProps) => {
  const {
    pack, target, manifest, saveBase, availableFiles, isLayered, reportStore, onConfirm, onSaved,
  } = props;
  const {
    layers, dirty, saving, error, addLayer, removeLayer, moveLayer, updateLayer, save, revert,
  } = useLayerEditor({ pack, target, manifest, saveBase, onSaved });
  // A loop point applies to a single-file layer, so only each layer's first file is consulted.
  const fileLoopSamples = useFileLoopSamples(
    pack, [...new Set(layers.map((layer) => layer.files[0]).filter((name) => name !== undefined))],
  );

  return (
    <Box className="layer-editor">
      <SectionHeader
        title={`Layers — ${target.label}`}
        subtitle={
          isLayered
            ? 'Each layer is scheduled on its own; they play together.'
            : 'This pack has no manifest yet. Saving writes one and keeps every other slot as it plays today.'
        }
        action={
          <Button variant="secondary" size="sm" disabled={saving} onClick={addLayer}>Add layer</Button>
        }
      />

      {layers.length === 0 ? (
        <EmptyState message="No layers yet — add one to give this slot audio" />
      ) : (
        layers.map((layer, index) => (
          <LayerCard
            key={layer.id}
            layer={layer}
            index={index}
            total={layers.length}
            available={availableFiles}
            fileLoopSample={fileLoopSamples.get(layer.files[0] ?? '') ?? null}
            disabled={saving}
            live={<LayerLive store={reportStore} previewKey={target.previewKey} layerId={layer.id} />}
            onConfirm={onConfirm}
            onChange={(patch) => updateLayer(layer.id, patch)}
            onMove={(delta) => moveLayer(layer.id, delta)}
            onRemove={() => removeLayer(layer.id)}
          />
        ))
      )}

      {error != null && <Text className="layer-editor__error">{error}</Text>}

      <ButtonRow align="start">
        <Button variant="primary" size="sm" disabled={saving || !dirty} onClick={() => void save()}>
          {saving ? 'Saving…' : 'Save layers'}
        </Button>
        <Button variant="tertiary" size="sm" disabled={saving || !dirty} onClick={revert}>Revert</Button>
        {dirty && !saving && <Text variant="caption">Unsaved changes</Text>}
      </ButtonRow>
    </Box>
  );
};

export { LayerEditor };
