/* @layer renderer-app @kind logic */
import { onCompletedChecksChanged, onEventStatusChanged, onInventoryChanged } from '@app/game/tracker';
import { onFiredLocation } from '@app/game/randomizer-client';

const rotpSubscribe = (fn: () => void): (() => void) => {
  const stops = [
    onInventoryChanged(fn), onCompletedChecksChanged(fn), onEventStatusChanged(fn), onFiredLocation(fn),
  ];
  return () => stops.forEach((stop) => stop());
};

export { rotpSubscribe };
