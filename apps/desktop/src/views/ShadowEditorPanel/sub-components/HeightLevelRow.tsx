/* @layer renderer-components @kind component */
import { Box, Icon, IconButton, TextInput, NumberInput } from '@drizztdourden08/tessera/primitives';
import { HeightSwatch } from './HeightSwatch';
import type { HeightLevelRowProps } from './HeightLevelRow.type';

const HeightLevelRow = ({ index, label, value, onUpdate, onRemove }: HeightLevelRowProps) => (
  <Box className="height-level-editor__item">
    <HeightSwatch className="height-level-editor__swatch" level={value} />
    <TextInput
      className="height-level-editor__name"
      value={label}
      onChange={(e) => onUpdate(index, { label: e.target.value })}
    />
    <NumberInput
      className="height-level-editor__value"
      value={value}
      min={0}
      max={1}
      step={0.05}
      onChange={(v) => {
        if (!isNaN(v)) onUpdate(index, { value: Math.min(1, Math.max(0, v)) });
      }}
    />
    <IconButton variant="ghost" tone="danger" size="xs" label="Remove" onClick={() => onRemove(index)}>
      <Icon name="x" />
    </IconButton>
  </Box>
);

export { HeightLevelRow };
