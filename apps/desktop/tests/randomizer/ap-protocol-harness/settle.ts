/* @layer tests @kind helper */
import { SETTLE_TICKS } from './ap-protocol-harness.constants';

const settle = async (): Promise<void> => {
  for (let i = 0; i < SETTLE_TICKS; i += 1) await Promise.resolve();
};

export { settle };
