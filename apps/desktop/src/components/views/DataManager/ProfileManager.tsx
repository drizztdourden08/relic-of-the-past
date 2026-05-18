import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../primitives/Button';
import { IconButton } from '../../primitives/IconButton';
import { Select } from '../../primitives/Select';
import { formatRelativeTime } from '../../../utils';

/** Human-readable labels for all GameSettings keys, grouped by category */
const SETTINGS_SECTIONS: Array<{ title: string; keys: Array<{ key: string; label: string; format?: (v: unknown) => string }> }> = [
  {
    title: 'General',
    keys: [
      { key: 'autosave', label: 'Autosave' },
      { key: 'displayPerfInTitle', label: 'FPS Counter' },
      { key: 'disableFrameDelay', label: 'Disable Frame Delay' },
    ],
  },
  {
    title: 'Display',
    keys: [
      { key: 'aspectRatio', label: 'Aspect Ratio' },
      { key: 'extendY', label: 'Extend Y' },
      { key: 'unchangedSprites', label: 'Unchanged Sprites' },
      { key: 'noVisualFixes', label: 'No Visual Fixes' },
      { key: 'windowMode', label: 'Window Mode', format: (v) => String(v ?? 'default') },
      { key: 'startFullscreen', label: 'Start Fullscreen' },
      { key: 'viewportConstraint', label: 'Viewport Constraint', format: (v) => String(v ?? 'none') },
    ],
  },
  {
    title: 'Graphics',
    keys: [
      { key: 'newRenderer', label: 'New Renderer' },
      { key: 'enhancedMode7', label: 'Enhanced Mode 7' },
      { key: 'noSpriteLimits', label: 'No Sprite Limits' },
      { key: 'linearFiltering', label: 'Linear Filtering' },
      { key: 'dimFlashes', label: 'Dim Flashes' },
    ],
  },
  {
    title: 'Audio',
    keys: [
      { key: 'masterVolume', label: 'Master Volume', format: (v) => `${v ?? 100}%` },
      { key: 'enableMSU', label: 'MSU Audio', format: (v) => v === 'false' || !v ? 'Off' : String(v) },
      { key: 'resumeMSU', label: 'Resume MSU' },
      { key: 'msuVolume', label: 'MSU Volume', format: (v) => `${v ?? 100}%` },
      { key: 'audioFreq', label: 'Audio Frequency', format: (v) => `${v ?? 44100} Hz` },
      { key: 'audioChannels', label: 'Audio Channels', format: (v) => v === 1 ? 'Mono' : 'Stereo' },
      { key: 'audioSamples', label: 'Audio Samples', format: (v) => String(v ?? 2048) },
    ],
  },
  {
    title: 'Gameplay',
    keys: [
      { key: 'itemSwitchLR', label: 'Item Switch L/R' },
      { key: 'itemSwitchLRLimit', label: 'Item Switch L/R Limit' },
      { key: 'turnWhileDashing', label: 'Turn While Dashing' },
      { key: 'mirrorToDarkworld', label: 'Mirror to Dark World' },
      { key: 'collectItemsWithSword', label: 'Collect Items with Sword' },
      { key: 'breakPotsWithSword', label: 'Break Pots with Sword' },
      { key: 'disableLowHealthBeep', label: 'Disable Low Health Beep' },
      { key: 'skipIntroOnKeypress', label: 'Skip Intro on Keypress' },
      { key: 'showMaxItemsInYellow', label: 'Show Max Items in Yellow' },
      { key: 'moreActiveBombs', label: 'More Active Bombs' },
      { key: 'carryMoreRupees', label: 'Carry More Rupees' },
      { key: 'miscBugFixes', label: 'Misc Bug Fixes' },
      { key: 'gameChangingBugFixes', label: 'Game-Changing Bug Fixes' },
      { key: 'cancelBirdTravel', label: 'Cancel Bird Travel' },
    ],
  },
];

function formatSettingValue(value: unknown, format?: (v: unknown) => string): string {
  if (format) return format(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value == null) return '—';
  return String(value);
}

export interface ProfileManagerProps {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onSelectProfile: (profile: Profile) => void;
  onCreateProfile: (name: string, romFile: string, language?: string, msuPack?: string) => void;
  onDeleteProfile: (id: string) => void;
  onRefresh: () => void;
  isGameRunning: boolean;
  onSwitchProfile: () => void;
}

export const ProfileManager = (props: ProfileManagerProps) => {
  const {
    profiles,
    romStatuses,
    onSelectProfile,
    onCreateProfile,
    onDeleteProfile,
    onRefresh,
    isGameRunning,
    onSwitchProfile,
  } = props;
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRom, setFormRom] = useState('');
  const [formLang, setFormLang] = useState('');
  const [formMsu, setFormMsu] = useState('');
  const [languages, setLanguages] = useState<Array<{ code: string }>>([]);
  const [msuPacks, setMsuPacks] = useState<Array<{ name: string }>>([]);
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);

  const readyRoms = romStatuses.filter((r) => r.hasAssets || r.extractionStatus === 'ready');
  const selectedProfile = profiles.find((p) => p.id === selected);

  // Load languages and MSU packs for create form
  useEffect(() => {
    window.api.listLanguages().then(setLanguages);
    window.api.listMsuPacks().then(setMsuPacks);
  }, [creating]);

  // Load settings for selected profile
  useEffect(() => {
    if (!selected) { setSettings(null); return; }
    window.api.readConfig(selected).then(setSettings);
  }, [selected]);

  const handleCreate = useCallback(() => {
    if (!formName.trim() || !formRom) return;
    onCreateProfile(
      formName.trim(),
      formRom,
      formLang || undefined,
      formMsu || undefined,
    );
    setCreating(false);
    setFormName('');
    setFormRom('');
    setFormLang('');
    setFormMsu('');
    onRefresh();
  }, [formName, formRom, formLang, formMsu, onCreateProfile, onRefresh]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') setCreating(false);
  };

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
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 className="detail-panel__title">{selectedProfile.name}</h3>

            {/* Editable profile options */}
            <div className="profile-form" style={{ marginBottom: 'var(--space-md)' }}>
              <div className="profile-form__field">
                <span className="profile-form__label">Language</span>
                <Select
                  value={selectedProfile.language || ''}
                  onChange={async (val) => {
                    await window.api.updateProfile(selectedProfile.id, { language: val || undefined });
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
                  value={selectedProfile.msuPack || ''}
                  onChange={async (val) => {
                    await window.api.updateProfile(selectedProfile.id, { msuPack: val || undefined });
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

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <Button variant="primary" size="sm" onClick={() => onSelectProfile(selectedProfile)}>
                Open Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={onSwitchProfile}>
                {isGameRunning ? 'Switch Profile…' : 'Switch Profile'}
              </Button>
            </div>

            {/* Profile info grid */}
            <div className="detail-panel__grid" style={{ marginBottom: 'var(--space-md)' }}>
              <span className="detail-panel__label">ROM</span>
              <span className="detail-panel__value">{selectedProfile.romFile}</span>
              <span className="detail-panel__label">Language</span>
              <span className="detail-panel__value">{selectedProfile.language || 'English (default)'}</span>
              <span className="detail-panel__label">MSU Pack</span>
              <span className="detail-panel__value">{selectedProfile.msuPack || 'None'}</span>
              <span className="detail-panel__label">Created</span>
              <span className="detail-panel__value">{new Date(selectedProfile.created).toLocaleDateString()}</span>
              <span className="detail-panel__label">Last Played</span>
              <span className="detail-panel__value">{formatRelativeTime(selectedProfile.lastPlayed)}</span>
            </div>

            {/* All settings — read-only */}
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
        )}
      </div>
    </div>
  );
};
