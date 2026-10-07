/* @layer renderer-components @kind component */
/** A network state on the design system's chip: the tone decides the colour, the label reads in capitals. */
import { Chip } from '@ds/primitives';
import type { Chip as ChipModel } from '../behavior/network-tone';

const StateChip = ({ tone, label }: ChipModel) => <Chip tone={tone} caps>{label}</Chip>;

export { StateChip };
