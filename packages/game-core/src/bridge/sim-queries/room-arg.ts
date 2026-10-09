/* @layer bridge-wasm @kind logic */
import type { RoomCallArgs } from './sim-queries.type';

const roomArg = (roomId: number): RoomCallArgs => ({ argTypes: ['number'], args: [roomId] });

export { roomArg };
