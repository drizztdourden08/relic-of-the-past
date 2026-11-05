/* @layer renderer-components @kind component */
import { useNavigation } from '@drizztdourden08/brock-react';
import { useGameSession } from '@app/hooks/useGameSession';
import { useProfileConnection } from '@app/hooks/randomizer/useProfileConnection';
import { RANDOMIZER_BUCKET, RUN_PANELS } from '../../Randomizer.constants';
import { OptionsSummary } from '../OptionsSummary';

const OptionsSummarySlot = () => {
  const { open } = useNavigation();
  const { activeProfile } = useGameSession().profileMgmt;
  const { config } = useProfileConnection(activeProfile);
  if (!config) return null;
  return (
    <OptionsSummary
      pool={RUN_PANELS.pool}
      settings={RUN_PANELS.settings}
      options={config.options}
      seed={config.seed}
      onOpenOptions={() => open(`${RANDOMIZER_BUCKET}/options`)}
    />
  );
};

export { OptionsSummarySlot };
