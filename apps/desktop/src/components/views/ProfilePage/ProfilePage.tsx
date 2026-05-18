import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { formatDate, formatRomName } from './behavior/formatters';
import './ProfilePage.css';

export interface ProfilePageProps {
  profile: Profile;
  romStatus: RomDisplayInfo | null;
  isGameRunning: boolean;
  onStartGame: () => void;
  onDeleteProfile: () => void;
  onSwitchProfile: () => void;
}

export const ProfilePage = (props: ProfilePageProps) => {
  const {
    profile,
    romStatus,
    isGameRunning,
    onStartGame,
    onDeleteProfile,
    onSwitchProfile,
  } = props;
  const assetsReady = romStatus?.extractionStatus === 'ready';

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h2 className="profile-page__name">{profile.name}</h2>
        <span className="profile-page__rom">{formatRomName(profile.romFile)}</span>
      </div>

      <div className="profile-page__details">
        <div className="profile-page__row">
          <span className="profile-page__label">ROM File</span>
          <span className="profile-page__value">{profile.romFile}</span>
        </div>
        <div className="profile-page__row">
          <span className="profile-page__label">Created</span>
          <span className="profile-page__value">{formatDate(profile.created)}</span>
        </div>
        <div className="profile-page__row">
          <span className="profile-page__label">Last Played</span>
          <span className="profile-page__value">{formatDate(profile.lastPlayed)}</span>
        </div>
        <div className="profile-page__row">
          <span className="profile-page__label">Assets</span>
          <span className="profile-page__value">
            {assetsReady ? (
              <Badge variant="success">✓ Ready</Badge>
            ) : (
              <Badge variant="danger">✗ Not extracted</Badge>
            )}
          </span>
        </div>
      </div>

      <div className="profile-page__actions">
        <Button
          variant="primary"
          size="md"
          onClick={onStartGame}
          disabled={!assetsReady || isGameRunning}
        >
          {isGameRunning ? '⟳ Game Running…' : '▶ Start Game'}
        </Button>
        <Button variant="secondary" size="md" onClick={onSwitchProfile}>
          Switch Profile
        </Button>
        <Button variant="danger" size="md" onClick={onDeleteProfile}>
          Delete Profile
        </Button>
      </div>
    </div>
  );
};
