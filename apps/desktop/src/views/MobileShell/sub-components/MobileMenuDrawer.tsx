/* @layer renderer-app @kind component */
import type { ReactNode } from 'react';
import type { MenuEntry, MenuItem } from '@drizztdourden08/brock-react';
import { Box, Button, Icon, Image, Text } from '@drizztdourden08/tessera/primitives';
import { MOBILE_LOGO, MOBILE_TITLE } from '../MobileShell.constants';
import type { MobileMenuDrawerProps } from '../MobileShell.type';

const isItem = (entry: MenuEntry): entry is MenuItem => entry !== 'separator';

const MobileMenuDrawer = (props: MobileMenuDrawerProps) => {
  const { entries, fps, isMuted, onToggleMute, onPick } = props;

  const renderItem = (item: MenuItem): ReactNode => {
    if (item.children?.length) {
      return (
        <Box key={item.key} className="mobile-menu__group">
          <Text className="mobile-menu__group-title">{item.label}</Text>
          {item.children.filter(isItem).map(renderItem)}
        </Box>
      );
    }
    return (
      <Button key={item.key} variant="ghost" fullWidth className="mobile-menu__item" disabled={item.disabled} active={item.checked} onClick={() => onPick(item)}>
        {item.label}
      </Button>
    );
  };

  return (
    <Box className="mobile-menu">
      <Box className="mobile-menu__header">
        <Image className="mobile-menu__logo" src={MOBILE_LOGO} alt="" />
        <Text className="mobile-menu__title">{MOBILE_TITLE}</Text>
        {fps > 0 ? <Text className="mobile-menu__fps">{fps} FPS</Text> : null}
      </Box>
      <Box className="mobile-menu__quick">
        <Button variant="ghost" fullWidth className="mobile-menu__item" icon={<Icon name={isMuted ? 'volume-x' : 'volume-2'} />} onClick={onToggleMute}>
          {isMuted ? 'Unmute' : 'Mute'}
        </Button>
      </Box>
      <Box className="mobile-menu__list">{entries.filter(isItem).map(renderItem)}</Box>
    </Box>
  );
};

export { MobileMenuDrawer };
