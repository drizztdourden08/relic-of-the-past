/* @layer tests @kind helper */
import { roomHashOf as roomHashText } from '@drizztdourden08/brock-randomizer/archipelago';

const ROOM_MISMATCH = '[Online] This save belongs to another Archipelago room';

const roomHashOf = (seedName: string): number => Number(roomHashText(seedName));

export { ROOM_MISMATCH, roomHashOf };
