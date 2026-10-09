/* @layer renderer-components @kind component */
import { Chip } from '@ds/primitives';
import type { Chip as ChipModel } from '../behavior/network-tone';

const StateChip = ({ tone, label }: ChipModel) => <Chip tone={tone} caps>{label}</Chip>;

export { StateChip };
