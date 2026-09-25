/* @layer renderer-components @kind component */
/**
 * BindingListHeader is the column header above a BindingRow list.
 *
 * One copy of the five-cell header the four binding lists all share; the
 * middle column is the only one that differs between them (the console button
 * on the classic list, the group on the core list, the assignment on the slot
 * list), so it is the only label a caller passes.
 */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';

interface BindingListHeaderProps {
  /** Middle column heading. Omitted for lists whose middle cell stays empty. */
  middleLabel?: string;
  actionLabel?: string;
}

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
