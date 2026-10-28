/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { MODE_LABELS, NO_PACK_NOTE } from './MsuDetectedSummary.constants';
import { packDetail } from './pack-detail';
import type { MsuDetectedSummaryProps } from './MsuDetectedSummary.type';
import './MsuDetectedSummary.css';

const MsuDetectedSummary = (props: MsuDetectedSummaryProps) => {
  const { pack, resolved } = props;
  const label = pack ? MODE_LABELS[resolved.enableMSU] : 'None';

  return (
    <Box className="msu-detected">
      <Text as="span" className={`msu-detected__mode ${pack ? '' : 'msu-detected__mode--off'}`}>
        {label}
      </Text>
      <Text as="span" className="msu-detected__meta">{pack ? packDetail(pack, resolved) : NO_PACK_NOTE}</Text>
    </Box>
  );
};

export { MsuDetectedSummary };
