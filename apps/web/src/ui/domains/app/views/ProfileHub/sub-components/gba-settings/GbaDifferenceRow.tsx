/* @layer renderer-components @kind component */
/** One read-only row in the Game Boy Advance difference catalogue: label, detail text,
  * and an evidence badge. Purely presentational — no data fetching, no state. */
import type { GbaDifference } from '@shared/features/gba-difference.type';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Badge } from '../../../../../../design-system/primitives/Badge';
import './GbaDifferenceRow.css';

interface GbaDifferenceRowProps {
  difference: GbaDifference;
}

const GbaDifferenceRow = (props: GbaDifferenceRowProps) => {
  const { difference } = props;

  return (
    <Box className="gba-difference-row">
      <Box className="gba-difference-row__text">
        <Text as="span" className="gba-difference-row__label">{difference.label}</Text>
        <Text as="p" className="gba-difference-row__detail">{difference.detail}</Text>
      </Box>
      <Badge
        variant={difference.evidence === 'extracted' ? 'success' : 'neutral'}
        className="gba-difference-row__badge"
      >
        {difference.evidence}
      </Badge>
    </Box>
  );
};

export { GbaDifferenceRow };
export type { GbaDifferenceRowProps };
