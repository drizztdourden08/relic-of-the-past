/* @layer renderer-components @kind component */
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { Badge } from '../../../../../design-system/primitives/Badge';
import { Button } from '../../../../../design-system/primitives/Button';
import { IconButton } from '../../../../../design-system/primitives/IconButton';
import { Select } from '../../../../../design-system/primitives/Select';
import { TextInput } from '../../../../../design-system/primitives/TextInput';
import { Field } from '../../../../../design-system/primitives/Field';
import { EmptyState } from '../../../../../design-system/primitives/EmptyState';
import { ButtonRow } from '../../../../../design-system/primitives/ButtonRow';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { MasterDetailLayout } from '../../../../../design-system/composites/MasterDetailLayout';
import { ListItemRow } from '../../../../../design-system/composites/ListItemRow';
import { formatRelativeTime } from '../../../../../../utils';
import type { CreateProfileOptions, CreateProfileResult } from '@shared/types/profile';
import { useProfileManager } from './profile-manager/useProfileManager';
import { ProfileDetailPanel } from './profile-manager/ProfileDetailPanel';
import { RandomizerFields } from './profile-manager/RandomizerFields';
import { RandomizerOptionsPanel } from './profile-manager/RandomizerOptionsPanel';

interface ProfileManagerProps {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onSelectProfile: (profile: Profile) => void;
  onCreateProfile: (opts: CreateProfileOptions) => Promise<CreateProfileResult>;
  onDeleteProfile: (id: string) => void;
  onRefresh: () => void;
  isGameRunning: boolean;
}

const ProfileManager = (props: ProfileManagerProps) => {
  const { profiles, romStatuses, onSelectProfile, onCreateProfile, onDeleteProfile, onRefresh, isGameRunning } = props;

  const {
    selected, setSelected,
    creating, setCreating,
    formName, setFormName,
    formRom, setFormRom,
    formLang, setFormLang,
    formMsu, setFormMsu,
    formRandomizer, setFormRandomizer,
    formPreset,
    formError, setFormError,
    languages, msuPacks,
    settings,
    readyRoms,
    selectedProfile,
    handleCreate,
    handleKeyDown,
    handlePickPreset,
  } = useProfileManager({ profiles, romStatuses, onCreateProfile, onRefresh });

  const list = (
    <>
      {creating ? (
        <Box className="profile-form" onKeyDown={handleKeyDown}>
          <Field label="Profile Name">
            <TextInput type="text" placeholder="My Profile" value={formName} onChange={(e) => setFormName(e.target.value)} autoFocus />
          </Field>
          <Field label="ROM">
            <Select
              value={formRom}
              onChange={(val) => setFormRom(val)}
              options={readyRoms.map((r) => ({ value: r.romFile, label: r.romFile }))}
              placeholder="Select ROM..."
            />
          </Field>
          <SegmentedControl
            label="Preset"
            value={formPreset}
            onChange={handlePickPreset}
            options={[
              { value: 'vanilla', label: 'Vanilla' },
              { value: 'enhanced', label: 'Enhanced' },
            ]}
          />
          <Field label="Language">
            <Select
              value={formLang}
              onChange={(val) => setFormLang(val)}
              options={[
                { value: '', label: 'Default (English)' },
                ...languages.map((l) => ({ value: l.code, label: l.code })),
              ]}
              placeholder="Default (English)"
            />
          </Field>
          <Field label="MSU Pack">
            <Select
              value={formMsu}
              onChange={(val) => setFormMsu(val)}
              options={[
                { value: '', label: 'None' },
                ...msuPacks.map((p) => ({ value: p.name, label: p.name })),
              ]}
              placeholder="None"
            />
          </Field>
          <RandomizerFields value={formRandomizer} onChange={setFormRandomizer} />
          {formError && <Text variant="caption" className="profile-form__error">{formError}</Text>}
          <ButtonRow>
            <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => void handleCreate()} disabled={!formName.trim() || !formRom}>Create</Button>
          </ButtonRow>
        </Box>
      ) : (
        readyRoms.length > 0 && (
          <Button variant="primary" fullWidth icon="+" onClick={() => { setFormError(null); setCreating(true); }}>
            New Profile
          </Button>
        )
      )}

      <Box className="data-list">
        {profiles.length === 0 && <EmptyState message="No profiles yet. Import a ROM to get started." />}
        {profiles.map((profile) => (
          <ListItemRow
            key={profile.id}
            icon="👤"
            name={
              <>
                {profile.name}
                {profile.automation && <Badge variant="neutral">Agent</Badge>}
              </>
            }
            meta={`${profile.romFile.replace(/\.(sfc|smc)$/i, '')} · ${formatRelativeTime(profile.lastPlayed)}`}
            selected={selected === profile.id}
            onClick={() => setSelected(profile.id)}
            onDoubleClick={() => onSelectProfile(profile)}
            action={
              <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => { e.stopPropagation(); onDeleteProfile(profile.id); }}>
                ✕
              </IconButton>
            }
          />
        ))}
      </Box>
    </>
  );

  // While the creation form has the randomizer enabled, the option catalog
  // takes over the whole detail pane, so the form keeps the fixed-width list
  // column and the options get the remaining side with their own scroll.
  const showOptionsPane = creating && formRandomizer.enabled;

  const detail = showOptionsPane ? (
    <RandomizerOptionsPanel
      romFile={formRom}
      // The form state IS the choices plus the connection fields, so it is
      // handed over whole: re-listing the option fields here is the second
      // list that forgets a row the catalog gained.
      value={formRandomizer}
      onChange={(next) => setFormRandomizer({ ...formRandomizer, ...next })}
    />
  ) : !selectedProfile ? (
    <Text>Select a profile to view details · Double-click to open</Text>
  ) : (
    <ProfileDetailPanel
      profile={selectedProfile}
      settings={settings}
      languages={languages}
      msuPacks={msuPacks}
      isGameRunning={isGameRunning}
      onSelectProfile={onSelectProfile}
      onRefresh={onRefresh}
    />
  );

  return (
    <MasterDetailLayout
      className={showOptionsPane ? 'master-detail--rand-options' : ''}
      list={list}
      detail={detail}
      detailEmpty={!showOptionsPane && !selectedProfile}
    />
  );
};

export { ProfileManager };
export type { ProfileManagerProps };
