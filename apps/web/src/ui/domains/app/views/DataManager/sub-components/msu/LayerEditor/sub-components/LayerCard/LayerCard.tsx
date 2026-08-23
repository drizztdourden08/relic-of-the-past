/* @layer renderer-components @kind component */
/**
 * One layer, presented for editing: what it is called, how loud it is, how it is scheduled, and
 * which files it draws from. Purely presentational — every edit leaves as a patch, so the card
 * never has to know whether the change is savable.
 */
import { Box } from '@ds/primitives/Box';
import { Card } from '@ds/primitives/Card';
import { Flex } from '@ds/primitives/Flex';
import { IconButton } from '@ds/primitives/IconButton';
import { Slider } from '@ds/primitives/Slider';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import { LayerEffectsField } from '../LayerEffectsField';
import { LayerFileList } from '../LayerFileList';
import { LoopPointField } from '../LoopPointField';
import { PlayModeFields } from '../PlayModeFields';
import { useModeChange } from './behavior/useModeChange';
import type { LayerCardProps } from './LayerCard.type';

/** Stable empty chain, so a layer without effects is not handed a fresh array on every render. */
const NO_EFFECTS: never[] = [];

const LayerCard = (props: LayerCardProps) => {
  const {
    layer, index, total, available, fileLoopSample, disabled = false, live,
    onConfirm, onChange, onMove, onRemove,
  } = props;
  const { changeMode } = useModeChange({ layer, onConfirm, onChange });
  // One track repeating on itself: the layer holds exactly that file, and it has an end of its own.
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

      <PlayModeFields
        mode={layer.mode}
        layerId={layer.id}
        disabled={disabled}
        onChange={changeMode}
      />

      {/* Only the one order that repeats a single file reaches that file's own end; every other
          order moves on to the next file, which starts from its top. */}
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
