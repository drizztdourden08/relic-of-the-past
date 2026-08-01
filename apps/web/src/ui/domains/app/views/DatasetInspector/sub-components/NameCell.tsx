/* @layer renderer-app @kind component */
import { Stack, Text } from '@ds/primitives';

interface NameCellProps {
  primary: string;
  secondary?: string;
}

/** The primary display name over its alternate wording, when the two differ — every kind's name pair renders the same way. */
const NameCell = (props: NameCellProps) => {
  const { primary, secondary } = props;
  return (
    <Stack gap="xs" className="dataset-inspector__name-cell">
      <Text>{primary}</Text>
      {secondary && <Text variant="caption" className="dataset-inspector__cell--dim">{secondary}</Text>}
    </Stack>
  );
};

export { NameCell };
export type { NameCellProps };
