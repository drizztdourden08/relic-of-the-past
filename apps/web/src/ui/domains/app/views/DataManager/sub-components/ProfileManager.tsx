/* @layer renderer-components @kind component */
/**
 * Profile Manager — list, create, and inspect game profiles.
 */

import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { Button } from '../../../../../design-system/primitives/Button';
import { IconButton } from '../../../../../design-system/primitives/IconButton';
import { Select } from '../../../../../design-system/primitives/Select';
import { TextInput } from '../../../../../design-system/primitives/TextInput';
import { Field } from '../../../../../design-system/primitives/Field';
import { EmptyState } from '../../../../../design-system/primitives/EmptyState';
import { ButtonRow } from '../../../../../design-system/primitives/ButtonRow';
import { MasterDetailLayout } from '../../../../../design-system/composites/MasterDetailLayout';
import { ListItemRow } from '../../../../../design-system/composites/ListItemRow';
import { formatRelativeTime } from '../../../../../../utils';
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
    languages, msuPacks,
    settings,
    readyRoms,
    selectedProfile,
    handleCreate,
    handleKeyDown,
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
              placeholder="Select ROM…"
            />
          </Field>
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
          <ButtonRow>
            <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={!formName.trim() || !formRom}>Create</Button>
          </ButtonRow>
        </Box>
      ) : (
        readyRoms.length > 0 && (
          <Button variant="primary" fullWidth icon="+" onClick={() => setCreating(true)}>
            New Profile
          </Button>
        )
      )}

      <Box className="data-list">
        {profiles.length === 0 && <EmptyState message="No profiles yet — import a ROM to get started" />}
        {profiles.map((profile) => (
          <ListItemRow
            key={profile.id}
            icon="👤"
            name={profile.name}
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

  const detail = !selectedProfile ? (
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

  return <MasterDetailLayout list={list} detail={detail} detailEmpty={!selectedProfile} />;
};

export { ProfileManager };
export type { ProfileManagerProps };
