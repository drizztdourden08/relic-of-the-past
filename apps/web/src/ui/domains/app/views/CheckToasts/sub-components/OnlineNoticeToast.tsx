/* @layer renderer-components @kind component */
/** One online notice in the play area's toast stack: item names and player names drawn apart. */
import { Box, Text } from '@ds/primitives';
import type { OnlineNotice } from '@app/lib/game/randomizer-client';

interface OnlineNoticeToastProps {
  notice: OnlineNotice;
}

const OnlineNoticeToast = ({ notice }: OnlineNoticeToastProps) => (
  <Box className="online-notice-toast">
    <Text className="online-notice-toast__line">
      {/* A line's parts never reorder, so their place is their key. */}
      {notice.parts.map((part, index) => (part.tone
        ? <Text key={index} className={`online-notice-toast__${part.tone}`}>{part.text}</Text>
        : part.text))}
    </Text>
  </Box>
);

export { OnlineNoticeToast };
