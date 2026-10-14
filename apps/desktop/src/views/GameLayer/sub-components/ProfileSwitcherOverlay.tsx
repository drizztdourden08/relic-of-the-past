/* @layer renderer-components @kind component */

import { Box, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { InputGlyph } from '../../../compounds/InputGlyph';
import { resolveFunctionMappingIcon } from '../../../game';
import type { FunctionMapping } from '@rotp/features';
import type { ProfileSwitcherOverlayProps } from './ProfileSwitcherOverlay.type';
import './ProfileSwitcherOverlay.css';

const hintGlyph = (m: FunctionMapping | null) =>
  m ? <InputGlyph binding={m.binding} icon={m.icon ?? resolveFunctionMappingIcon(m)} showLabel={false} /> : null;

const ProfileSwitcherOverlay = (props: ProfileSwitcherOverlayProps) => {
  const { open, profiles, activeId, prevMapping, nextMapping } = props;

  return (
    <Box className={`profile-switcher ${open ? 'profile-switcher--open' : ''}`}>
      <Text className="profile-switcher__title">Input Profile</Text>
      <Box className="profile-switcher__list">
        {profiles.map((p) => (
          <Box
            key={p.id}
            className={`profile-switcher__item ${p.id === activeId ? 'profile-switcher__item--active' : ''}`}
          >
            <Text className="profile-switcher__item-icon">
              <Icon name={p.deviceType === 'keyboard' ? 'keyboard' : 'gamepad-2'} />
            </Text>
            <Text className="profile-switcher__item-name">{p.name}</Text>
          </Box>
        ))}
      </Box>
      {(prevMapping !== null || nextMapping !== null) && (
        <Box className="profile-switcher__hint">
          {hintGlyph(prevMapping)}{hintGlyph(nextMapping)}
          <Text className="profile-switcher__hint-label">Switch</Text>
        </Box>
      )}
    </Box>
  );
};

export { ProfileSwitcherOverlay };
