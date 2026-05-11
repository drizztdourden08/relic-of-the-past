import { Card } from '../../composites/Card';
import { IconButton } from '../../primitives/IconButton';
import './ProfileCard.css';

interface ProfileCardProps {
  profile: Profile;
  onSelect: (profile: Profile) => void;
  onDelete: (id: string) => void;
}

function formatDate(ts: number): string {
  if (!ts) return 'Never';
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatRomName(romFile: string): string {
  return romFile.replace(/\.(sfc|smc)$/i, '');
}

export function ProfileCard({ profile, onSelect, onDelete }: ProfileCardProps): JSX.Element {
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
}
