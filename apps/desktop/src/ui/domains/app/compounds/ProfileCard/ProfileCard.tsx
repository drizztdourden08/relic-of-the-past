/* @layer renderer-components @kind component */
import { Box } from '../../../../design-system/primitives/Box';
import { Flex } from '../../../../design-system/primitives/Flex';
import { Text } from '../../../../design-system/primitives/Text';
import { IconButton } from '../../../../design-system/primitives/IconButton';
import { formatDate, formatRomName } from './behavior/formatters';
import './ProfileCard.css';
import { type ProfileCardProps } from './ProfileCard.type';

const ProfileCard = (props: ProfileCardProps) => {
  const { profile, onSelect, onDelete } = props;

  return (
    <Box as="button" className="profile-card" onClick={() => onSelect(profile)}>
      <Flex direction="column" className="profile-card__main">
        <Text className="profile-card__name">{profile.name}</Text>
        <Text className="profile-card__rom">{formatRomName(profile.romFile)}</Text>
      </Flex>
      <Flex align="center" className="profile-card__meta">
        <Text className="profile-card__date">{formatDate(profile.lastPlayed)}</Text>
        <IconButton
          variant="danger"
          label={`Delete ${profile.name}`}
          onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}
        >
          ✕
        </IconButton>
      </Flex>
    </Box>
  );
};

export {
  ProfileCard,
};
