/* @layer renderer-components @kind component */
import { Card } from '@drizztdourden08/tessera/primitives';
import { useProfileConnection } from '@app/hooks/randomizer/useProfileConnection';
import { ConnectionEditor } from '@app/views/Randomizer/sub-components/NetworkTab/sub-components/ConnectionEditor';
import type { ProfileConnectionSectionProps } from './profile-detail.type';

const ProfileConnectionSection = ({ profile, randomizer }: ProfileConnectionSectionProps) => {
  const { config, saveConnection } = useProfileConnection(profile);

  return (
    <Card title="Connection" level={4}>
      <ConnectionEditor config={config ?? randomizer} sessionError={null} onSave={saveConnection} />
    </Card>
  );
};

export { ProfileConnectionSection };
