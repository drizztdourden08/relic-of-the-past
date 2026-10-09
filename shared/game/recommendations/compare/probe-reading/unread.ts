/* @layer shared-game @kind logic */
import type { Probe } from '../probe.type';

const unread = <V>(): Probe<V> => ({ known: false });

export { unread };
