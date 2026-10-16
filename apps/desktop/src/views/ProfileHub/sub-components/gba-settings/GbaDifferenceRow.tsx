/* @layer renderer-components @kind component */
import { Box, Text, Status } from '@drizztdourden08/tessera/primitives';
import { EVIDENCE_STATUS } from './gba-settings.constants';
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
      <Status map={EVIDENCE_STATUS} value={difference.evidence} className="gba-difference-row__badge" />
    </Box>
  );
};

export { GbaDifferenceRow };
