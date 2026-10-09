/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { MODE_LABELS } from './MsuDetectedSummary.constants';
import { packDetail } from './pack-detail';
import type { MsuDetectedSummaryProps } from './MsuDetectedSummary.type';
import './MsuDetectedSummary.css';

const MsuDetectedSummary = (props: MsuDetectedSummaryProps) => {
  const { pack, resolved } = props;
  const label = pack ? MODE_LABELS[resolved.enableMSU] : 'None';

  return (
    <Box className="msu-detected">
      <Box className="msu-detected__header">
        <Text as="span" className="msu-detected__label">Pack Format</Text>
        <Text as="span" className="msu-detected__description">
          {pack
            ? 'Read from the pack assigned to this profile.'
            : 'No pack assigned to this profile. Assign one in Data Manager.'}
        </Text>
      </Box>
      <Box className="msu-detected__value">
        <Text as="span" className={`msu-detected__mode ${pack ? '' : 'msu-detected__mode--off'}`}>
          {label}
        </Text>
        {pack && <Text as="span" className="msu-detected__meta">{packDetail(pack, resolved)}</Text>}
      </Box>
    </Box>
  );
};

export { MsuDetectedSummary };
