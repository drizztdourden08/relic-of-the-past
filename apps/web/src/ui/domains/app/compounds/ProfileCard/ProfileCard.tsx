/* @layer renderer-components @kind component */
import { IconButton } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { formatRomName } from '../../../../../utils/formatRomName';
import { formatDate } from './behavior/format-date';
import { type ProfileCardProps } from './ProfileCard.type';

const ProfileCard = (props: ProfileCardProps) => {
  const { profile, onSelect, onDelete } = props;

  const remove = (
    <IconButton variant="danger" label={`Delete ${profile.name}`} onClick={() => onDelete(profile.id)}>
      ✕
    </IconButton>
  );

  return (
    <ListItemRow
      name={profile.name}
      meta={formatRomName(profile.romFile)}
      columns={[{ primary: formatDate(profile.lastPlayed), align: 'end' }]}
      action={remove}
      onClick={() => onSelect(profile)}
    />
  );
};

export {
  ProfileCard,
};
