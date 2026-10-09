/* @layer renderer-other @kind logic */
import { deviceKeySlots } from './device-key-slots';

const deviceKeyForId = (sdlId: number): string | undefined => deviceKeySlots.byId.get(sdlId)?.deviceKey;

export { deviceKeyForId };
