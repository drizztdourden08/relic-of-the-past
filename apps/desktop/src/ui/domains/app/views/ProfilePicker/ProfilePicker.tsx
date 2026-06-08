/* @layer renderer-components @kind data */
import { useState } from 'react';
import { ProfileCard } from '../../compounds/ProfileCard';
import { RomCard } from '../../compounds/RomCard';
import { CreateProfileForm } from '../../compounds/CreateProfileForm';
import { Button } from '../../../../design-system/primitives/Button';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import './ProfilePicker.css';
import type { ProfilePickerProps } from './ProfilePicker.type';


const ProfilePicker = (props: ProfilePickerProps) => {
  const {
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
  } = props;
  const [creating, setCreating] = useState(false);
  const readyRoms = romStatuses.filter((r) => r.hasAssets);

  return (
    <Box className="picker">
      <Box className="picker__header">
        <Text as="h2" className="picker__title">Relic of the Past</Text>
        <Text as="p" className="picker__subtitle">
          Import ROMs and create profiles with isolated saves and settings
        </Text>
      </Box>

      {loadingProfile && (
        <Box className="picker__loading">
          <Text className="picker__loading-spinner">⟳</Text>
          Loading profile: {loadingProfile}…
        </Box>
      )}

      <Box className="picker__columns">
        {/* ─── Left: Profiles ─── */}
        <Box className="picker__col">
          <Text as="h3" className="picker__col-title">Profiles</Text>

          <Box className="picker__list">
            {profiles.length === 0 && (
              <Box className="picker__empty">
                No profiles yet — import a ROM to get started
              </Box>
            )}
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onSelect={onSelectProfile}
                onDelete={onDeleteProfile}
              />
            ))}
          </Box>

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
        </Box>

        {/* ─── Right: ROM Library ─── */}
        <Box className="picker__col">
          <Text as="h3" className="picker__col-title">ROM Library</Text>

          <Box className="picker__list">
            {romStatuses.length === 0 && (
              <Box className="picker__empty">No ROMs imported yet</Box>
            )}
            {romStatuses.map((rom) => (
              <RomCard
                key={rom.romFile}
                rom={rom}
                onExtract={onExtractAssets}
                onDelete={onDeleteRom}
              />
            ))}
          </Box>

          <Button
            variant="secondary"
            fullWidth
            icon={importingRom ? '⟳' : '📁'}
            onClick={onImportRom}
            disabled={importingRom}
          >
            {importingRom ? 'Importing ROM…' : 'Import ROM'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export { ProfilePicker };
