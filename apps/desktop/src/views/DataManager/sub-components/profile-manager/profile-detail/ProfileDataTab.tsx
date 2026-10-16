/* @layer renderer-components @kind component */
import { Spinner, Stack } from '@drizztdourden08/tessera/primitives';
import { buildControlFacts } from './build-control-facts';
import { buildPlayFacts } from './build-play-facts';
import { buildSaveFacts } from './build-save-facts';
import { FactsSection } from './FactsSection';
import { useProfileData } from './useProfileData';
import type { ProfileDataTabProps } from './profile-detail.type';

const ProfileDataTab = ({ profile, settings }: ProfileDataTabProps) => {
  const data = useProfileData(profile.id);

  if (data === null) return <Spinner size="md" />;
  return (
    <Stack gap="lg">
      <FactsSection title="Saves" hint="Load, rename and delete saves from the profile's own screen." facts={[buildSaveFacts(data)]} />
      <FactsSection title="Play" facts={[buildPlayFacts(data)]} />
      <FactsSection title="Controls" hint="Controller profiles belong to this profile." facts={[buildControlFacts(data, settings)]} />
    </Stack>
  );
};

export { ProfileDataTab };
