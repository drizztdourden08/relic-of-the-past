/* @layer renderer-components @kind component */
/**
 * ProfileSwitcherOverlay — transient drawer on the left of the game canvas that
 * appears while cycling input profiles (PageUp/PageDown by default). Lists the
 * profiles with the active one highlighted; auto-hides. Presentational.
 */

import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { InputGlyph } from '../../../compounds/InputGlyph';
import { resolveFunctionMappingIcon } from '../../../../../../lib/game';
import type { FunctionMapping, InputProfile } from '@shared/types/controls';
import './ProfileSwitcherOverlay.css';

interface ProfileSwitcherOverlayProps {
  open: boolean;
  profiles: InputProfile[];
  activeId: string | null;
  prevMapping: FunctionMapping | null;
  nextMapping: FunctionMapping | null;
}

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
            <Text className="profile-switcher__item-icon">{p.deviceType === 'keyboard' ? '⌨️' : '🎮'}</Text>
            <Text className="profile-switcher__item-name">{p.name}</Text>
          </Box>
        ))}
      </Box>
      {(prevMapping || nextMapping) && (
        <Box className="profile-switcher__hint">
          {hintGlyph(prevMapping)}{hintGlyph(nextMapping)}
          <Text className="profile-switcher__hint-label">Switch</Text>
        </Box>
      )}
    </Box>
  );
};

export { ProfileSwitcherOverlay };
