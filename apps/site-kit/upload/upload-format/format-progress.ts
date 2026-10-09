/* @layer site-kit @kind logic */
import { formatBytes } from '../../lib/format-bytes';

const formatProgress = (sent: number, total: number): string => {
  const done = formatBytes(sent);
  const whole = formatBytes(total);
  const [doneValue, doneUnit] = done.split(' ');
  const [, wholeUnit] = whole.split(' ');
  return doneUnit === wholeUnit ? `${doneValue} of ${whole}` : `${done} of ${whole}`;
};

export { formatProgress };
