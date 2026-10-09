/* @layer renderer-components @kind component */
import { Button, Flex, Text, IconButton } from '@drizztdourden08/tessera/primitives';
import { formatRomName } from '../../../../../utils/formatRomName';
import { formatDate } from './behavior/format-date';
import './ProfileCard.css';
import { type ProfileCardProps } from './ProfileCard.type';

const ProfileCard = (props: ProfileCardProps) => {
  const { profile, onSelect, onDelete } = props;

  return (
    <Button variant="bare" className="profile-card" onClick={() => onSelect(profile)}>
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
    </Button>
  );
};

export {
  ProfileCard,
};
