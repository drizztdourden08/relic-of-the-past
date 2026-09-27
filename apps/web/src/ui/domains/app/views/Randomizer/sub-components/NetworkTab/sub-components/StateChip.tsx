/* @layer renderer-components @kind component */
/** A small uppercase chip, its colour taken from the tone (ok, warn, bad, idle). */
import { Text } from '@ds/primitives';
import type { Chip } from '../behavior/network-tone';

const StateChip = ({ tone, label }: Chip) => (
  <Text className={`network-tab__chip network-tab__chip--${tone}`}>{label}</Text>
);

export { StateChip };
