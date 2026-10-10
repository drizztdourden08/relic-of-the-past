/* @layer shared-game @kind logic */
import { LEDGE_EXIT_STEPS } from './can-leave-ledge.constants';

const canLeaveLedge = (dir: string, dr: number, dc: number): boolean => {
  const exit = LEDGE_EXIT_STEPS.get(dir);
  if (exit === undefined) return false;
  const [exitDr, exitDc] = exit;
  return dr === exitDr || dc === exitDc;
};

export { canLeaveLedge };
