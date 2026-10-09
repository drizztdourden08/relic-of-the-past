/* @layer renderer-components @kind component */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Badge } from '../../../../../../design-system/primitives/Badge';
import type { GbaDifferenceRowProps } from './gba-settings.type';
import './GbaDifferenceRow.css';

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
