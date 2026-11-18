/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { MODE_LABELS } from './MsuDetectedSummary.constants';
import { packDetail } from './pack-detail';
import type { MsuDetectedSummaryProps } from './MsuDetectedSummary.type';
import './MsuDetectedSummary.css';

const MsuDetectedSummary = (props: MsuDetectedSummaryProps) => {
  const { pack, resolved } = props;
  const t = useT();
  const text = useText();

  return (
    <Box className="msu-detected">
      <Box className="msu-detected__header">
        <Text as="span" className="msu-detected__label">{t('settings-controls:audio.pack-format')}</Text>
        {!pack && <Text as="span" className="msu-detected__description">{t('settings-controls:audio.no-pack')}</Text>}
      </Box>
      {pack && (
        <Box className="msu-detected__value">
          <Text as="span" className="msu-detected__mode">{text(MODE_LABELS[resolved.enableMSU])}</Text>
          <Text as="span" className="msu-detected__meta">{packDetail(pack, resolved, t)}</Text>
        </Box>
      )}
    </Box>
  );
};

export { MsuDetectedSummary };
