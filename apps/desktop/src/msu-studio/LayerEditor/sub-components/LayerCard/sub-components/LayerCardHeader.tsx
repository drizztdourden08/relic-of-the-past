/* @layer renderer-components @kind component */
import { Box, Flex, IconButton, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import type { LayerCardHeaderProps } from './LayerCardHeader.type';

const LayerCardHeader = (props: LayerCardHeaderProps) => {
  const { layer, index, total, disabled, onChange, onMove, onRemove } = props;
  return (
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
  );
};

export { LayerCardHeader };
