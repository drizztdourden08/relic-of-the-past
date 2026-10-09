/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { applyNotchMode } from '@drizztdourden08/brock-react';
import { getInputManager } from '@app/lib/game';
import { isAutoFlood } from '@app/lib/startup/is-auto-flood';

const useAppMainEffects = (params: { isGameRunning: boolean; screenOpen: boolean; openNavWidget: () => void }) => {
  const { isGameRunning, screenOpen, openNavWidget } = params;

  useEffect(() => { applyNotchMode(true); }, []);

  useEffect(() => {
    if (isAutoFlood()) openNavWidget();
  }, []);

  useEffect(() => {
    getInputManager().setInputSuppressed(!(isGameRunning && !screenOpen));
  }, [isGameRunning, screenOpen]);
};

export { useAppMainEffects };
