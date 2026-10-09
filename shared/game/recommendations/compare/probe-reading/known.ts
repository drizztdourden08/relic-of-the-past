/* @layer shared-game @kind logic */
import type { Probe } from '../probe.type';

const known = <V>(value: V | undefined | null): Probe<V | undefined> => (
  { known: true, value: value ?? undefined }
);

export { known };
