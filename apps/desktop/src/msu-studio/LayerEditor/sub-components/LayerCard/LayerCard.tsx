/* @layer renderer-components @kind component */
import { Box, Card, Flex, IconButton, Slider, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { LayerEffectsField } from '../LayerEffectsField';
import { LayerFileList } from '../LayerFileList';
import { LoopPointField } from '../LoopPointField';
import { PlayModeFields } from '../PlayModeFields';
import { useModeChange } from './behavior/useModeChange';
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
      <Flex gap="sm" align="center" className="layer-card__header">
        <Text className="layer-card__index">{index + 1}</Text>
        <Box className="layer-card__name">
          <TextInput
            type="text"
            value={layer.name}
            aria-label={`Layer ${index + 1} name`}
            placeholder="Layer name"
            disabled={disabled}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </Box>
        <IconButton
          variant="ghost" size="sm" label="Move layer up" disabled={disabled || index === 0}
          onClick={() => onMove(-1)}
        >
          ↑
        </IconButton>
        <IconButton
          variant="ghost" size="sm" label="Move layer down" disabled={disabled || index === total - 1}
          onClick={() => onMove(1)}
        >
          ↓
        </IconButton>
        <IconButton variant="danger" size="sm" label="Remove layer" disabled={disabled} onClick={onRemove}>
          ✕
        </IconButton>
      </Flex>

      {live}

      <Slider
        label="Volume"
        value={layer.volume}
        min={0}
        max={100}
        step={1}
        disabled={disabled}
        showValue
        formatValue={(value) => `${value}%`}
        onChange={(volume) => onChange({ volume })}
      />

      <Slider
        label="Chance"
        description="How often this layer sounds when it starts. 100% is every time."
        value={layer.chance ?? 100}
        min={1}
        max={100}
        step={1}
        disabled={disabled}
        showValue
        formatValue={(value) => `${value}%`}
        onChange={(chance) => onChange({ chance: chance >= 100 ? undefined : chance })}
      />

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
