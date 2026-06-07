/* @layer renderer-components @kind component */
/**
 * Profile Manager — list, create, and inspect game profiles.
 */

import { Button } from '../../../primitives/Button';
import { IconButton } from '../../../primitives/IconButton';
import { Select } from '../../../primitives/Select';
import { formatRelativeTime } from '../../../../utils';
import { useProfileManager } from './profile-manager/useProfileManager';
import { ProfileDetailPanel } from './profile-manager/ProfileDetailPanel';

interface ProfileManagerProps {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onSelectProfile: (profile: Profile) => void;
  onCreateProfile: (name: string, romFile: string, language?: string, msuPack?: string) => void;
  onDeleteProfile: (id: string) => void;
  onRefresh: () => void;
  isGameRunning: boolean;
  onSwitchProfile: () => void;
}

const ProfileManager = (props: ProfileManagerProps) => {
  const { profiles, romStatuses, onSelectProfile, onCreateProfile, onDeleteProfile, onRefresh, isGameRunning, onSwitchProfile } = props;

  const {
    selected, setSelected,
    creating, setCreating,
    formName, setFormName,
    formRom, setFormRom,
    formLang, setFormLang,
    formMsu, setFormMsu,
    languages, msuPacks,
    settings,
    readyRoms,
    selectedProfile,
    handleCreate,
    handleKeyDown,
  } = useProfileManager({ profiles, romStatuses, onCreateProfile, onRefresh });

  return (
    <div className="data-columns">
      <div className="data-columns__left">
        {creating ? (
          <div className="profile-form" onKeyDown={handleKeyDown}>
            <div className="profile-form__field">
              <span className="profile-form__label">Profile Name</span>
              <input
                className="profile-form__input"
                type="text"
                placeholder="My Profile"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="profile-form__field">
              <span className="profile-form__label">ROM</span>
              <Select
                value={formRom}
                onChange={(val) => setFormRom(val)}
                options={readyRoms.map((r) => ({ value: r.romFile, label: r.romFile }))}
                placeholder="Select ROM…"
              />
            </div>
            <div className="profile-form__field">
              <span className="profile-form__label">Language</span>
              <Select
                value={formLang}
                onChange={(val) => setFormLang(val)}
                options={[
                  { value: '', label: 'Default (English)' },
                  ...languages.map((l) => ({ value: l.code, label: l.code })),
                ]}
                placeholder="Default (English)"
              />
            </div>
            <div className="profile-form__field">
              <span className="profile-form__label">MSU Pack</span>
              <Select
                value={formMsu}
                onChange={(val) => setFormMsu(val)}
                options={[
                  { value: '', label: 'None' },
                  ...msuPacks.map((p) => ({ value: p.name, label: p.name })),
                ]}
                placeholder="None"
              />
            </div>
            <div className="profile-form__actions">
              <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleCreate} disabled={!formName.trim() || !formRom}>Create</Button>
            </div>
          </div>
        ) : (
          readyRoms.length > 0 && (
            <Button variant="primary" fullWidth icon="+" onClick={() => setCreating(true)}>
              New Profile
            </Button>
          )
        )}

        <div className="data-list">
          {profiles.length === 0 && (
            <div className="data-list-empty" style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
              No profiles yet — import a ROM to get started
            </div>
          )}
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`data-list-item ${selected === profile.id ? 'data-list-item--selected' : ''}`}
              onClick={() => setSelected(profile.id)}
              onDoubleClick={() => onSelectProfile(profile)}
            >
              <span className="data-list-item__icon">👤</span>
              <div className="data-list-item__info">
                <div className="data-list-item__name">{profile.name}</div>
                <div className="data-list-item__meta">
                  {profile.romFile.replace(/\.(sfc|smc)$/i, '')} · {formatRelativeTime(profile.lastPlayed)}
                </div>
              </div>
              <div className="data-list-item__action">
                <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => { e.stopPropagation(); onDeleteProfile(profile.id); }}>
                  ✕
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`data-columns__right ${!selectedProfile ? 'data-columns__right--empty' : ''}`}>
        {!selectedProfile ? (
          <span>Select a profile to view details · Double-click to open</span>
        ) : (
          <ProfileDetailPanel
            profile={selectedProfile}
            settings={settings}
            languages={languages}
            msuPacks={msuPacks}
            isGameRunning={isGameRunning}
            onSelectProfile={onSelectProfile}
            onSwitchProfile={onSwitchProfile}
            onRefresh={onRefresh}
          />
        )}
      </div>
    </div>
  );
};

export { ProfileManager };
export type { ProfileManagerProps };
