/* @layer renderer-components @kind component */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
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
