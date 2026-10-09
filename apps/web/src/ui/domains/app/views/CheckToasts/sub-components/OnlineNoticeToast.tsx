/* @layer renderer-components @kind component */
import { Box, Text } from '@ds/primitives';
import type { OnlineNoticeToastProps } from '../CheckToasts.type';

const OnlineNoticeToast = ({ notice }: OnlineNoticeToastProps) => (
  <Box className="online-notice-toast">
    <Text className="online-notice-toast__line">
      {notice.parts.map((part, partIndexAsKey) => (part.tone
        ? <Text key={partIndexAsKey} className={`online-notice-toast__${part.tone}`}>{part.text}</Text>
        : part.text))}
    </Text>
  </Box>
);

export { OnlineNoticeToast };
