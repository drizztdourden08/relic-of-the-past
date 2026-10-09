/* @layer renderer-components @kind component */
import { Box, Text, Status, Button, IconButton, Select, TextInput, Field, EmptyState, ButtonRow, SegmentedControl, Spinner, Stack, Icon } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout, ListItemRow } from '@drizztdourden08/tessera/composites';
import { formatRelativeTime } from '@drizztdourden08/brock-core';
import { useProfileManager } from './profile-manager/useProfileManager';
import { ProfileDetailPanel } from './profile-manager/ProfileDetailPanel';
import { RandomizerFields } from './profile-manager/RandomizerFields';
import { RandomizerOptionsPanel } from './profile-manager/RandomizerOptionsPanel';
import type { ProfileManagerProps } from './ProfileManager.type';

const ProfileManager = (props: ProfileManagerProps) => {
  const { profiles, romStatuses, onSelectProfile, onCreateProfile, onDeleteProfile, onRefresh, isGameRunning, loadingProfile = null } = props;

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
    formInvalid,
    handleKeyDown,
    handlePickPreset,
  } = useProfileManager({ profiles, romStatuses, onCreateProfile, onRefresh });

  const list = (
    <>
      {loadingProfile && <ListItemRow selected icon={<Spinner size="sm" />} name={`Loading profile: ${loadingProfile}...`} />}
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
            <Button variant="primary" size="sm" onClick={() => void handleCreate()} disabled={!formName.trim() || !formRom || formInvalid}>Create</Button>
          </ButtonRow>
        </Box>
      ) : (
        readyRoms.length > 0 && (
          <Button variant="primary" fullWidth icon={<Icon name="plus" />} onClick={() => { setFormError(null); setCreating(true); }}>
            New Profile
          </Button>
        )
      )}

      <Stack gap="xs">
        {profiles.length === 0 && <EmptyState message="No profiles yet. Import a ROM to get started." />}
        {profiles.map((profile) => (
          <ListItemRow
            key={profile.id}
            icon={<Icon name="user" />}
            name={
              <>
                {profile.name}
                {profile.automation && <Status tone="neutral">Agent</Status>}
              </>
            }
            meta={`${profile.romFile.replace(/\.(sfc|smc)$/i, '')} · ${formatRelativeTime(profile.lastPlayed)}`}
            selected={selected === profile.id}
            onClick={() => setSelected(profile.id)}
            onDoubleClick={() => onSelectProfile(profile)}
            action={
              <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => { e.stopPropagation(); onDeleteProfile(profile.id); }}>
                <Icon name="x" />
              </IconButton>
            }
          />
        ))}
      </Stack>
    </>
  );

  const showOptionsPane = creating && formRandomizer.enabled;

  const detail = showOptionsPane ? (
    <RandomizerOptionsPanel
      romFile={formRom}
      seed={formRandomizer.seed}
      value={formRandomizer}
      onChange={(next) => setFormRandomizer({ ...formRandomizer, ...next })}
    />
  ) : selectedProfile && (
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
    <ListDetailLayout
      list={list}
      detail={detail}
      emptyDetail={<EmptyState message="Select a profile to view details · Double-click to open" />}
    />
  );
};

export { ProfileManager };
