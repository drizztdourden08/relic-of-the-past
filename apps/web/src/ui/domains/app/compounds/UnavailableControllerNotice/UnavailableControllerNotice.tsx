/* @layer renderer-components @kind component */
/**
 * Explains an unavailable device and offers both remedies on the same card,
 * since the API can prove the device is connected and unclaimed but can't
 * prove why: another process might hold it (Steam is the common case) or the
 * mapping database might not know it.
 */
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { MappingPasteBox } from '../MappingPasteBox';
import type { UnavailableControllerNoticeProps } from './UnavailableControllerNotice.type';
import './UnavailableControllerNotice.css';

const EXPLANATION =
  'Another application may have exclusive access to this controller. Steam is the most common cause. Close it, then rescan.';

const UnavailableControllerNotice = (props: UnavailableControllerNoticeProps) => {
  const { onAddMapping } = props;
  return (
    <Box className="unavailable-controller-notice">
      <Text as="p" className="unavailable-controller-notice__text">{EXPLANATION}</Text>
      <MappingPasteBox onSubmit={onAddMapping} />
    </Box>
  );
};

export { UnavailableControllerNotice };
