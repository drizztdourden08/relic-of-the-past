/* @layer renderer-widgets @kind hook */
import { useCallback } from 'react';
import type { RefObject } from 'react';
import { useSimulatorStore } from '@app/stores/simulator-store';
import type { RunControl } from '../SimulatorWidget.type';

const useRunControl = (control: RefObject<RunControl>) => {
  const pause = useCallback(() => {
    control.current.paused = true;
    useSimulatorStore.getState().setStatus('paused');
  }, [control]);

  const resume = useCallback(() => {
    control.current.paused = false;
    useSimulatorStore.getState().setStatus('running');
  }, [control]);

  const stop = useCallback(() => {
    control.current.running = false;
    control.current.paused = false;
    useSimulatorStore.getState().setStatus('done');
  }, [control]);

  return { pause, resume, stop };
};

export { useRunControl };
