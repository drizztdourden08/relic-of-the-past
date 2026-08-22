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
import { LayerFileList } from '../LayerFileList';
import { PlayModeFields } from '../PlayModeFields';
import type { LayerCardProps } from './LayerCard.type';

const LayerCard = (props: LayerCardProps) => {
  const { layer, index, total, available, disabled = false, live, onChange, onMove, onRemove } = props;

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
        onChange={(mode) => onChange({ mode })}
      />

      <LayerFileList
        files={layer.files}
        available={available}
        disabled={disabled}
        onChange={(files) => onChange({ files })}
      />
    </Card>
  );
};

export { LayerCard };
