/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { BindingListHeaderProps } from './controls.type';

const BindingListHeader = ({ middleLabel = '', actionLabel = 'Action' }: BindingListHeaderProps) => {
  return (
    <Box className="binding-row binding-row--header">
      <Text className="binding-row__action-label">{actionLabel}</Text>
      <Box className="binding-row__icon-slot" />
      <Text className="binding-row__snes-label">{middleLabel}</Text>
      <Box className="binding-row__icon-slot" />
      <Text className="binding-row__binding-label">Binding</Text>
    </Box>
  );
};

export { BindingListHeader };
