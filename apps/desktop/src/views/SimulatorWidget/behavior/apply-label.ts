/* @layer renderer-widgets @kind logic */
import type { ApplyState } from '../SimulatorWidget.type';

const applyLabel = (state: ApplyState): string => {
  if (state === 'applied') return 'Applied';
  if (state === 'applying') return 'Applying...';
  return 'Apply';
};

export { applyLabel };
