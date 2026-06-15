/* @layer renderer-components @kind component */
import { Box, Button, Text, Image } from '@ds/primitives';
import type { DrawerMenuItem } from '../MobileChrome.type';

interface OptionsDrawerProps {
  items: DrawerMenuItem[];
  fps: number;
  showFps: boolean;
  isMuted: boolean;
  onToggleMute?: () => void;
}

const renderItem = (item: DrawerMenuItem) => {
  if (item.children?.length) {
    return (
      <Box key={item.key} className="options-drawer__group">
        <Text className="options-drawer__group-title">{item.icon} {item.label}</Text>
        {item.children.map((child) => renderItem(child))}
      </Box>
    );
  }
  return (
    <Button key={item.key} variant="bare" className="options-drawer__item" disabled={item.disabled} onClick={item.onClick}>
      <Text className="options-drawer__icon">{item.icon}</Text>
      <Text className="options-drawer__label">{item.label}</Text>
      {item.checked ? <Text className="options-drawer__check">✓</Text> : null}
    </Button>
  );
};

const OptionsDrawer = (props: OptionsDrawerProps) => {
  const { items, fps, showFps, isMuted, onToggleMute } = props;

  return (
    <Box className="options-drawer">
      <Box className="options-drawer__header">
        <Image className="options-drawer__logo" src="./logos/logo-512.png" alt="" />
        <Text className="options-drawer__title">Relic of the Past</Text>
        {showFps ? <Text className="options-drawer__fps">{fps} FPS</Text> : null}
      </Box>
      <Box className="options-drawer__quick">
        <Button variant="bare" className="options-drawer__item" onClick={onToggleMute}>
          <Text className="options-drawer__icon">{isMuted ? '🔇' : '🔊'}</Text>
          <Text className="options-drawer__label">{isMuted ? 'Unmute' : 'Mute'}</Text>
        </Button>
      </Box>
      <Box className="options-drawer__list">
        {items.map((item) => renderItem(item))}
      </Box>
    </Box>
  );
};

export { OptionsDrawer };
