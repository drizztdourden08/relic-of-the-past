/* @layer renderer-components @kind component */
import { useNavigation } from '@drizztdourden08/brock-react';
import { useGameSession } from '@app/hooks/useGameSession';
import { useProfileConnection } from '@app/hooks/randomizer/useProfileConnection';
import { useRandomizerSession } from '../../behavior/useRandomizerSession';
import { RANDOMIZER_BUCKET, RUN_PANELS } from '../../Randomizer.constants';
import { RunSummary } from '../RunSummary';

const RunSummarySlot = () => {
  const { open } = useNavigation();
  const { activeProfile } = useGameSession().profileMgmt;
  const { config } = useProfileConnection(activeProfile);
  const { session, source, status, gameRunning } = useRandomizerSession();
  if (!config || !activeProfile) return null;
  return (
    <RunSummary
      placement={RUN_PANELS.summary}
      profileName={activeProfile.name}
      config={config}
      session={session}
      source={source}
      status={status}
      gameRunning={gameRunning}
      onOpenNetwork={() => open(`${RANDOMIZER_BUCKET}/extra/network`)}
    />
  );
};

export { RunSummarySlot };
