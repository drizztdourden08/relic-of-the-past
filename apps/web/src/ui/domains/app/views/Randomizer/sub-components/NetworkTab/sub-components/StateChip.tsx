/* @layer renderer-components @kind component */
import { Status } from '@drizztdourden08/tessera/primitives';
import type { Chip as ChipModel } from '../behavior/network-tone';

const StateChip = ({ tone, label }: ChipModel) => <Status tone={tone} variant="pill" dot>{label}</Status>;

export { StateChip };
