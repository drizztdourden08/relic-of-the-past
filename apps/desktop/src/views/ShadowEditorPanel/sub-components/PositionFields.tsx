/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { NumberField } from './NumberField';
import type { PositionFieldsProps } from './PositionFields.type';

const PositionFields = ({ x, y, onX, onY }: PositionFieldsProps) => (
  <Box className="shadow-editor-panel__field-row">
    <NumberField icon="X" value={x} step={1} onChange={onX} />
    <NumberField icon="Y" value={y} step={1} onChange={onY} />
  </Box>
);

export { PositionFields };
