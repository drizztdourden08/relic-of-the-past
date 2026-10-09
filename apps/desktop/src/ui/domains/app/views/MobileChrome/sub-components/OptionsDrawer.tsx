/* @layer renderer-components @kind component */
import type { ReactNode } from 'react';
import type { MenuItem, MenuNode } from '@drizztdourden08/tessera/composites';
import { Box, Button, Icon, Image, Text } from '@drizztdourden08/tessera/primitives';
import type { OptionsDrawerProps } from '../MobileChrome.type';

const iconOf = (icon: MenuItem['icon']): ReactNode =>
  typeof icon === 'string' ? <Icon name={icon} /> : icon;

const isItem = (node: MenuNode): node is MenuItem => !('separator' in node);

const renderItem = (item: MenuItem): ReactNode => {
  if (item.children?.length) {
    return (
      <Box key={item.id} className="options-drawer__group">
        <Text className="options-drawer__group-title">{item.label}</Text>
        {item.children.filter(isItem).map(renderItem)}
      </Box>
    );
  }
  return (
    <Button
      key={item.id}
      variant="ghost"
      fullWidth
      className="options-drawer__item"
      icon={iconOf(item.icon)}
      disabled={item.disabled}
      active={item.checked}
      onClick={item.onSelect}
    >
      {item.label}
    </Button>
  );
};

const OptionsDrawer = (props: OptionsDrawerProps) => {
  const { groups, fps, showFps, isMuted, onToggleMute } = props;

  return (
    <Box className="options-drawer">
      <Box className="options-drawer__header">
        <Image className="options-drawer__logo" src="./logos/logo/logo-512.png" alt="" />
        <Text className="options-drawer__title">Relic of the Past</Text>
        {showFps ? <Text className="options-drawer__fps">{fps} FPS</Text> : null}
      </Box>
      <Box className="options-drawer__quick">
        <Button variant="ghost" fullWidth className="options-drawer__item" icon={<Icon name={isMuted ? 'volume-x' : 'volume-2'} />} onClick={onToggleMute}>
          {isMuted ? 'Unmute' : 'Mute'}
        </Button>
      </Box>
      <Box className="options-drawer__list">
        {groups.map((group) => (
          <Box key={group.id} className="options-drawer__section">{group.items.filter(isItem).map(renderItem)}</Box>
        ))}
      </Box>
    </Box>
  );
};

export { OptionsDrawer };
