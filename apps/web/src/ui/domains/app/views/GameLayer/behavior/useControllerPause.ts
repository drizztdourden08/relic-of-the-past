/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { getInputManager } from '../../../../../../lib/game';
import { CONTROLLER_PRESENCE_DELAY_MS } from '../GameLayer.constants';

const useControllerPause = (status: string) => {
  const [controllerPaused, setControllerPaused] = useState(false);
  const [disconnectedName, setDisconnectedName] = useState('');

  useEffect(() => {
    if (status !== 'running') return;
    const inputMgr = getInputManager();
    const unsub = inputMgr.onPauseChange((paused, name) => {
      setControllerPaused(paused);
      setDisconnectedName(name);
    });
    return unsub;
  }, [status]);

  useEffect(() => {
    if (status !== 'running') return;
    const id = setTimeout(() => getInputManager().checkControllerPresence(), CONTROLLER_PRESENCE_DELAY_MS);
    return () => clearTimeout(id);
  }, [status]);

  return { controllerPaused, disconnectedName };
};

export { useControllerPause };
