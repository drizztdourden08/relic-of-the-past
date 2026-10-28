/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { MODE_LABELS, NO_PACK_LINE } from './MsuDetectedSummary.constants';
import { packDetail } from './pack-detail';
import type { MsuDetectedSummaryProps } from './MsuDetectedSummary.type';
import './MsuDetectedSummary.css';

const MsuDetectedSummary = (props: MsuDetectedSummaryProps) => {
  const { pack, resolved } = props;

  return (
    <Box className="msu-detected">
      <Box className="msu-detected__header">
        <Text as="span" className="msu-detected__label">Pack Format</Text>
        {!pack && <Text as="span" className="msu-detected__description">{NO_PACK_LINE}</Text>}
      </Box>
      {pack && (
        <Box className="msu-detected__value">
          <Text as="span" className="msu-detected__mode">{MODE_LABELS[resolved.enableMSU]}</Text>
          <Text as="span" className="msu-detected__meta">{packDetail(pack, resolved)}</Text>
        </Box>
      )}
    </Box>
  );
};

export { MsuDetectedSummary };
