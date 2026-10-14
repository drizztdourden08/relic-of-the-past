/* @layer renderer-widgets @kind hook */
import { useCallback, useMemo, useRef, useState } from 'react';
import type { SimulatorPort } from '@rotp/navigation';
import type { CheckId, ItemId } from '@rotp/game-data';
import type { SimLogWriter } from '@app/game/simulator';
import { resumeSramSync } from '@app/game/sram-sync';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import type { RunControl, RunRefs } from '../SimulatorWidget.type';
import { startRun } from './start-run';
import { useRunControl } from './useRunControl';

const useSimulatorRun = () => {
  const [stopAtCheckId, setStopAtCheckId] = useWidgetPref<CheckId | ''>('simulator', 'stopAtCheckId', '');
  const [screenLimit, setScreenLimit] = useWidgetPref<number | null>('simulator', 'screenLimit', null);
  const [canRestore, setCanRestore] = useState(false);
  const screenLimitRef = useRef<number | null>(null);
  screenLimitRef.current = screenLimit;

  const control = useRef<RunControl>({ running: false, paused: false });
  const port = useRef<SimulatorPort | null>(null);
  const writer = useRef<SimLogWriter | null>(null);
  const snapshot = useRef<ArrayBuffer | null>(null);
  const item = useRef<ItemId | undefined>(undefined);
  const refs: RunRefs = useMemo(() => ({ control, port, writer, snapshot, item }), []);
  const { pause, resume, stop } = useRunControl(control);

  const start = useCallback(
    () => startRun(refs, { stopAtCheckId, screenLimitRef, onCanRestore: setCanRestore }),
    [refs, stopAtCheckId],
  );

  const restore = useCallback(async () => {
    const buffer = snapshot.current;
    if (buffer && port.current) {
      await port.current.restoreState(buffer);
      resumeSramSync();
    }
  }, []);

  const openLog = useCallback(async () => {
    await writer.current?.openLog();
  }, []);

  return { stopAtCheckId, setStopAtCheckId, screenLimit, setScreenLimit, canRestore, start, pause, resume, stop, restore, openLog };
};

export { useSimulatorRun };
