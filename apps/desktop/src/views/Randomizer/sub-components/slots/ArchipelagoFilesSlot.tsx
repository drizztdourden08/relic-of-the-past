/* @layer renderer-components @kind component */
import { useGameSession } from '@app/hooks/useGameSession';
import { useProfileConnection } from '@app/hooks/randomizer/useProfileConnection';
import { RUN_PANELS } from '../../Randomizer.constants';
import { ArchipelagoFiles } from '../ArchipelagoFiles';
import { DashboardCard } from '../DashboardCard';

const ArchipelagoFilesSlot = () => {
  const { activeProfile } = useGameSession().profileMgmt;
  const { config } = useProfileConnection(activeProfile);
  if (config?.mode !== 'online') return null;
  return (
    <DashboardCard placement={RUN_PANELS.files} title="Archipelago files">
      <ArchipelagoFiles config={config} />
    </DashboardCard>
  );
};

export { ArchipelagoFilesSlot };
