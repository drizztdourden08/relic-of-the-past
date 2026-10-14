/* @layer renderer-widgets @kind logic */
import type { SimConfig } from '@rotp/navigation';
import { createLiveGamePort, createSimLogWriter } from '@app/game/simulator';
import { pauseSramSync, resumeSramSync } from '@app/game/sram-sync';
import { useSimulatorStore } from '@app/stores/simulator-store';
import { FEATURES_LATCH_WAIT_MS } from '../SimulatorWidget.constants';
import type { RunRefs, StartParams } from '../SimulatorWidget.type';
import { driveRun } from './drive-run';
import { sleep } from './sleep';

const startRun = async (refs: RunRefs, params: StartParams): Promise<void> => {
  const { control, port: portRef, writer: writerRef, snapshot, item } = refs;
  const { stopAtCheckId, screenLimitRef, onCanRestore } = params;
  if (control.current.running) return;
  const runId = `run-${Date.now()}`;
  const port = createLiveGamePort();
  const writer = createSimLogWriter(runId);
  portRef.current = port;
  writerRef.current = writer;
  control.current = { running: true, paused: false };
  item.current = undefined;
  useSimulatorStore.getState().beginRun(runId);

  snapshot.current = await port.snapshotState();
  onCanRestore(true);
  pauseSramSync();
  port.setSimulatorSupport(true);
  port.setAutoSkipDialog(true);
  port.setDeveloperTools(true);
  await sleep(FEATURES_LATCH_WAIT_MS);
  const unsubscribe = port.onItemReceived((id) => { item.current = id; });
  const config: SimConfig = {
    ...(stopAtCheckId ? { stopAtCheckId } : {}),
    ...(screenLimitRef.current != null ? { screenLimit: screenLimitRef.current } : {}),
  };
  const takeItem = () => {
    const received = item.current;
    item.current = undefined;
    return received;
  };

  try {
    await driveRun({ port, writer, config, control, takeItem });
  } finally {
    unsubscribe();
    port.setAutoSkipDialog(null);
    port.setDeveloperTools(null);
    port.setSimulatorSupport(false);
    control.current.running = false;
    resumeSramSync();
  }
};

export { startRun };
