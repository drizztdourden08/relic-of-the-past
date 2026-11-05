/* @layer renderer-components @kind component */
import { RUN_PANELS } from '../../Randomizer.constants';
import { RunProgress } from '../RunProgress';
import { useNetworkStatus } from '../NetworkTab';

const RunProgressSlot = () => {
  const { status } = useNetworkStatus();
  return <RunProgress placement={RUN_PANELS.progress} room={status?.progress ?? null} />;
};

export { RunProgressSlot };
