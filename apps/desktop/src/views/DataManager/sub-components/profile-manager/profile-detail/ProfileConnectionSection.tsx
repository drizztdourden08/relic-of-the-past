/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Card, Stack, Toggle } from '@drizztdourden08/tessera/primitives';
import { useProfileConnection } from '@app/hooks/randomizer/useProfileConnection';
import { ConnectionEditor } from '@app/views/Randomizer/sub-components/NetworkTab/sub-components/ConnectionEditor';
import type { ProfileConnectionSectionProps } from './profile-detail.type';

const ProfileConnectionSection = ({ profile, randomizer }: ProfileConnectionSectionProps) => {
  const { config, saveConnection } = useProfileConnection(profile);
  const current = config ?? randomizer;
  const setFlag = useCallback(
    (field: 'deathLink' | 'trackOtherPlayers') => (value: boolean) => void saveConnection({ [field]: value }),
    [saveConnection],
  );

  return (
    <Card title="Connection" subtitle="The server this profile plays on. These save as you change them." level={4}>
      <Stack gap="md">
        <ConnectionEditor config={current} sessionError={null} onSave={saveConnection} />
        <Toggle label="DeathLink" checked={current.deathLink ?? false} onChange={setFlag('deathLink')} />
        <Toggle
          label="Track other players"
          checked={current.trackOtherPlayers ?? false}
          onChange={setFlag('trackOtherPlayers')}
        />
      </Stack>
    </Card>
  );
};

export { ProfileConnectionSection };
