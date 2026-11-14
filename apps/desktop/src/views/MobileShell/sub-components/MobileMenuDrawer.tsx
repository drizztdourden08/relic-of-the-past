/* @layer renderer-app @kind component */
import { useState } from 'react';
import type { MenuItem } from '@drizztdourden08/brock-react';
import { Box, Button, Icon, IconButton, Image, Text } from '@drizztdourden08/tessera/primitives';
import { menuGroupsOf } from '../behavior/menu-groups-of';
import { MOBILE_LOGO, MOBILE_TITLE, NO_ENTRIES } from '../MobileShell.constants';
import type { MobileMenuDrawerProps } from '../MobileShell.type';
import { MobileMenuRow } from './MobileMenuRow';

const MobileMenuDrawer = (props: MobileMenuDrawerProps) => {
  const { entries, fps, isMuted, onToggleMute, onPick } = props;
  const [trail, setTrail] = useState<MenuItem[]>([]);
  const parent = trail.at(-1);
  const shown = parent ? (parent.children ?? NO_ENTRIES) : entries;
  const press = (item: MenuItem): void => {
    if (item.children?.length) setTrail([...trail, item]);
    else onPick(item);
  };

  return (
    <Box className="mobile-menu">
      <Box className="mobile-menu__header">
        <Image className="mobile-menu__logo" src={MOBILE_LOGO} alt="" />
        <Text className="mobile-menu__title">{MOBILE_TITLE}</Text>
        {fps > 0 ? <Text className="mobile-menu__fps">{fps} FPS</Text> : null}
        <IconButton variant="ghost" label={isMuted ? 'Unmute' : 'Mute'} active={isMuted} onClick={onToggleMute}>
          <Icon name={isMuted ? 'volume-x' : 'volume-2'} />
        </IconButton>
      </Box>
      {parent ? (
        <Button variant="ghost" fullWidth className="mobile-menu__back" icon={<Icon name="chevron-left" />} onClick={() => setTrail(trail.slice(0, -1))}>
          {parent.label}
        </Button>
      ) : null}
      <Box key={trail.length} className="mobile-menu__list" data-depth={trail.length}>
        {menuGroupsOf(shown).map((group) => (
          <Box key={group.key} className="mobile-menu__group">
            {group.title ? <Text className="mobile-menu__group-title">{group.title}</Text> : null}
            {group.items.map((item) => <MobileMenuRow key={item.key} item={item} onPress={press} />)}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { MobileMenuDrawer };
