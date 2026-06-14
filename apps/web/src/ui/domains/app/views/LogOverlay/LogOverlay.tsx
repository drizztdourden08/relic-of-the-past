/* @layer renderer-components @kind component */
import { useRef } from 'react';
import { usePlatform } from '@app/platform';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { Icon } from '../../../../design-system/primitives/Icon';
import { IconButton } from '../../../../design-system/primitives/IconButton';
import { useLogOverlay } from './behavior/useLogOverlay';
import { formatTime } from './behavior/formatTime';
import { CHANNEL_COLORS } from '../../../../../lib/log-bus';
import './LogOverlay.css';
import { DEVTOOLS_ICON_PATHS, CLOSE_ICON_PATHS } from './LogOverlay.constants';
import type { LogOverlayProps } from './LogOverlay.type';

const LogOverlay = (props: LogOverlayProps) => {
  const { visible: externalVisible, onClose } = props;
  const { window: win } = usePlatform();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { visible: f12Visible, setVisible: setF12Visible, entries } = useLogOverlay(bottomRef);

  const show = externalVisible || f12Visible;
  if (!show) return null;

  const handleClose = () => {
    setF12Visible(false);
    onClose();
  };

  return (
    <Box className="log-overlay">
      <Box className="log-overlay__header">
        <Text className="log-overlay__title">Log</Text>
        <Text className="log-overlay__hint">F12 to toggle</Text>
        <IconButton variant="ghost" size="sm" label="Open DevTools" onClick={() => win.openDevTools()}>
          <Icon paths={DEVTOOLS_ICON_PATHS} size={12} />
        </IconButton>
        <IconButton variant="ghost" size="sm" label="Close logs" onClick={handleClose}>
          <Icon paths={CLOSE_ICON_PATHS} size={10} viewBox="0 0 14 14" />
        </IconButton>
      </Box>
      <Box className="log-overlay__body">
        {entries.map((entry, i) => (
          <Box key={`${entry.id}-${i}`} className={`log-entry log-entry--${entry.level}`}>
            <Text className="log-entry__time">{formatTime(entry.timestamp)}</Text>
            <Text className="log-entry__channel" style={{ color: CHANNEL_COLORS[entry.channel] }}>
              {entry.channel}:
            </Text>
            <Text className="log-entry__message">{entry.message}</Text>
          </Box>
        ))}
        <Box ref={bottomRef} />
      </Box>
    </Box>
  );
};

export { LogOverlay };
