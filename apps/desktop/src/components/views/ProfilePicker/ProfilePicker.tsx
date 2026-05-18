import { useState } from 'react';
import { ProfileCard } from '../../compounds/ProfileCard';
import { RomCard } from '../../compounds/RomCard';
import { CreateProfileForm } from '../../compounds/CreateProfileForm';
import { Button } from '../../primitives/Button';
import './ProfilePicker.css';

interface ProfilePickerProps {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onSelectProfile: (profile: Profile) => void;
  onCreateProfile: (name: string, romFile: string) => void;
  onDeleteProfile: (id: string) => void;
  onImportRom: () => void;
  onExtractAssets: (romFile: string) => void;
  onDeleteRom: (romFile: string) => void;
  importingRom?: boolean;
  loadingProfile?: string | null;
}

export function ProfilePicker({
  profiles,
  romStatuses,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  onImportRom,
  onExtractAssets,
  onDeleteRom,
  importingRom = false,
  loadingProfile = null,
}: ProfilePickerProps): JSX.Element {
  const [creating, setCreating] = useState(false);
  const readyRoms = romStatuses.filter((r) => r.hasAssets);

  return (
    <div className="picker">
      <div className="picker__header">
        <h2 className="picker__title">Relic of the Past</h2>
        <p className="picker__subtitle">
          Import ROMs and create profiles with isolated saves and settings
        </p>
      </div>

      {loadingProfile && (
        <div className="picker__loading">
          <span className="picker__loading-spinner">⟳</span>
          Loading profile: {loadingProfile}…
        </div>
      )}

      <div className="picker__columns">
        {/* ─── Left: Profiles ─── */}
        <div className="picker__col">
          <h3 className="picker__col-title">Profiles</h3>

          <div className="picker__list">
            {profiles.length === 0 && (
              <div className="picker__empty">
                No profiles yet — import a ROM to get started
              </div>
            )}
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onSelect={onSelectProfile}
                onDelete={onDeleteProfile}
              />
            ))}
          </div>

          {creating ? (
            <CreateProfileForm
              readyRoms={readyRoms}
              onCreate={(name, rom) => {
                onCreateProfile(name, rom);
                setCreating(false);
              }}
              onCancel={() => setCreating(false)}
            />
          ) : (
            readyRoms.length > 0 && (
              <Button
                variant="primary"
                fullWidth
                icon="+"
                onClick={() => setCreating(true)}
              >
                New Profile
              </Button>
            )
          )}
        </div>

        {/* ─── Right: ROM Library ─── */}
        <div className="picker__col">
          <h3 className="picker__col-title">ROM Library</h3>

          <div className="picker__list">
            {romStatuses.length === 0 && (
              <div className="picker__empty">No ROMs imported yet</div>
            )}
            {romStatuses.map((rom) => (
              <RomCard
                key={rom.romFile}
                rom={rom}
                onExtract={onExtractAssets}
                onDelete={onDeleteRom}
              />
            ))}
          </div>

          <Button
            variant="secondary"
            fullWidth
            icon={importingRom ? '⟳' : '📁'}
            onClick={onImportRom}
            disabled={importingRom}
          >
            {importingRom ? 'Importing ROM…' : 'Import ROM'}
          </Button>
        </div>
      </div>
    </div>
  );
}
