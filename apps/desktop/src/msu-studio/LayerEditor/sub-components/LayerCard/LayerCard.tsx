/* @layer renderer-components @kind component */
import { Card } from '@drizztdourden08/tessera/primitives';
import { LayerEffectsField } from '../LayerEffectsField';
import { LayerFileList } from '../LayerFileList';
import { LoopPointField } from '../LoopPointField';
import { PlayModeFields } from '../PlayModeFields';
import { useModeChange } from './behavior/useModeChange';
import { LayerCardHeader } from './sub-components/LayerCardHeader';
import { LayerSliders } from './sub-components/LayerSliders';
import { NO_EFFECTS } from './LayerCard.constants';
import type { LayerCardProps } from './LayerCard.type';

const LayerCard = (props: LayerCardProps) => {
  const {
    layer, index, total, available, fileLoopSample, disabled = false, live,
    onConfirm, onChange, onMove, onRemove,
  } = props;
  const { changeMode } = useModeChange({ layer, onConfirm, onChange });
  const single = layer.mode.kind === 'loop' && layer.mode.order === 'single';

  return (
    <Card className="layer-card">
      <LayerCardHeader
        layer={layer}
        index={index}
        total={total}
        disabled={disabled}
        onChange={onChange}
        onMove={onMove}
        onRemove={onRemove}
      />

      {live}

      <LayerSliders layer={layer} disabled={disabled} onChange={onChange} />

      <PlayModeFields
        mode={layer.mode}
        layerId={layer.id}
        disabled={disabled}
        onChange={changeMode}
      />

      {single && (
        <LoopPointField
          loopSample={layer.loopSample}
          fileLoopSample={fileLoopSample}
          layerId={layer.id}
          disabled={disabled}
          onChange={(loopSample) => onChange({ loopSample })}
        />
      )}

      <LayerEffectsField
        effects={layer.effects ?? NO_EFFECTS}
        layerId={layer.id}
        disabled={disabled}
        onChange={(effects) => onChange({ effects: effects.length === 0 ? undefined : effects })}
      />

      <LayerFileList
        files={layer.files}
        available={available}
        oneFileOnly={single}
        disabled={disabled}
        onChange={(files) => onChange({ files })}
      />
    </Card>
  );
};

export { LayerCard };
