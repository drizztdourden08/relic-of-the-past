/* @layer renderer-components @kind component */
import { Box, Icon, Image } from '@drizztdourden08/tessera/primitives';
import { NO_SCREENSHOT_CANCEL, NO_SCREENSHOT_FRAME } from '../SaveSlot.constants';
import type { SlotScreenshotProps } from '../SaveSlot.type';

const SlotScreenshot = ({ screenshotUrl, isEmpty, slotNumber }: SlotScreenshotProps) => {
  if (screenshotUrl) {
    return <Image src={screenshotUrl} alt={`Slot ${slotNumber}`} className="save-slot__img" />;
  }
  if (isEmpty) return null;

  return (
    <Box className="save-slot__empty">
      <Box className="save-slot__empty-badge">
        <Icon
          className="save-slot__badge-frame"
          path={NO_SCREENSHOT_FRAME}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Icon
          className="save-slot__badge-cancel"
          path={NO_SCREENSHOT_CANCEL}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Box>
      <Image src="./logos/sentri/sentri-trimmed.png" alt="" className="save-slot__empty-mascot" />
    </Box>
  );
};

export { SlotScreenshot };
