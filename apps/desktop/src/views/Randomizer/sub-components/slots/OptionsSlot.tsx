/* @layer renderer-components @kind component */
import { useGameSession } from '@app/hooks/useGameSession';
import { useProfileConnection } from '@app/hooks/randomizer/useProfileConnection';
import { OptionsTab } from '../OptionsTab';

const OptionsSlot = () => {
  const { activeProfile } = useGameSession().profileMgmt;
  const { config } = useProfileConnection(activeProfile);
  return <OptionsTab config={config} romFile={activeProfile?.romFile ?? null} />;
};

export { OptionsSlot };
