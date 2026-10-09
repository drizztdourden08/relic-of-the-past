/* @layer site-kit @kind logic */
import { formatProgress } from './format-progress';
import { formatRate } from './format-rate';

const formatTransfer = (sent: number, total: number, bytesPerSecond: number | null): string =>
  (bytesPerSecond && bytesPerSecond > 0 ? `${formatProgress(sent, total)} · ${formatRate(bytesPerSecond)}` : formatProgress(sent, total));

export { formatTransfer };
