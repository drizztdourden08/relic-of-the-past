/* @layer renderer-components @kind component */
﻿import { Card } from '../../../../design-system/primitives/Card';
import { IconButton } from '../../../../design-system/primitives/IconButton';
import { formatDate, formatRomName } from './behavior/formatters';
import './ProfileCard.css';
import { type ProfileCardProps } from './ProfileCard.type';


const ProfileCard = (props: ProfileCardProps) => {
  const { profile, onSelect, onDelete } = props;

  return (
    <button className="profile-card" onClick={() => onSelect(profile)}>
      <div className="profile-card__main">
        <span className="profile-card__name">{profile.name}</span>
        <span className="profile-card__rom">{formatRomName(profile.romFile)}</span>
      </div>
      <div className="profile-card__meta">
        <span className="profile-card__date">{formatDate(profile.lastPlayed)}</span>
        <IconButton
          variant="danger"
          label={`Delete ${profile.name}`}
          onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}
        >
          ✕
        </IconButton>
      </div>
    </button>
  );
};

export {
  ProfileCard,
};
