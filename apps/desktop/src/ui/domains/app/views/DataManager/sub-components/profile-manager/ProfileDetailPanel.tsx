/* @layer renderer-components @kind component */
/**
 * Profile detail panel — right-side display of selected profile info + settings.
 */

import { Select } from '../../../../../../design-system/primitives/Select';
import { Button } from '../../../../../../design-system/primitives/Button';
import { formatRelativeTime } from '../../../../../../../utils';
import { formatSettingValue, SETTINGS_SECTIONS } from './settings-sections';

interface ProfileDetailPanelProps {
  profile: Profile;
  settings: Record<string, unknown> | null;
  languages: Array<{ code: string }>;
  msuPacks: Array<{ name: string }>;
  isGameRunning: boolean;
  onSelectProfile: (profile: Profile) => void;
  onSwitchProfile: () => void;
  onRefresh: () => void;
}

const ProfileDetailPanel = (props: ProfileDetailPanelProps) => {
  const { profile, settings, languages, msuPacks, isGameRunning, onSelectProfile, onSwitchProfile, onRefresh } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 className="detail-panel__title">{profile.name}</h3>

      <div className="profile-form" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="profile-form__field">
          <span className="profile-form__label">Language</span>
          <Select
            value={profile.language || ''}
            onChange={async (val) => {
              await window.api.updateProfile(profile.id, { language: val || undefined });
              onRefresh();
            }}
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
            value={profile.msuPack || ''}
            onChange={async (val) => {
              await window.api.updateProfile(profile.id, { msuPack: val || undefined });
              onRefresh();
            }}
            options={[
              { value: '', label: 'None' },
              ...msuPacks.map((p) => ({ value: p.name, label: p.name })),
            ]}
            placeholder="None"
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        <Button variant="primary" size="sm" onClick={() => onSelectProfile(profile)}>
          Open Profile
        </Button>
        <Button variant="ghost" size="sm" onClick={onSwitchProfile}>
          {isGameRunning ? 'Switch Profile…' : 'Switch Profile'}
        </Button>
      </div>

      <div className="detail-panel__grid" style={{ marginBottom: 'var(--space-md)' }}>
        <span className="detail-panel__label">ROM</span>
        <span className="detail-panel__value">{profile.romFile}</span>
        <span className="detail-panel__label">Language</span>
        <span className="detail-panel__value">{profile.language || 'English (default)'}</span>
        <span className="detail-panel__label">MSU Pack</span>
        <span className="detail-panel__value">{profile.msuPack || 'None'}</span>
        <span className="detail-panel__label">Created</span>
        <span className="detail-panel__value">{new Date(profile.created).toLocaleDateString()}</span>
        <span className="detail-panel__label">Last Played</span>
        <span className="detail-panel__value">{formatRelativeTime(profile.lastPlayed)}</span>
      </div>

      {settings && (
        <div style={{ flex: 1, overflow: 'auto', marginTop: 'var(--space-xs)' }}>
          {SETTINGS_SECTIONS.map((section) => (
            <div key={section.title} className="detail-panel__section">
              <h4 className="detail-panel__section-title">{section.title}</h4>
              <div className="profile-overview__settings">
                {section.keys.map(({ key, label, format }) => (
                  <div key={key} className="profile-overview__setting">
                    <span className="profile-overview__setting-label">{label}</span>
                    <span className="profile-overview__setting-value">{formatSettingValue((settings as Record<string, unknown>)[key], format)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { ProfileDetailPanel };
export type { ProfileDetailPanelProps };
