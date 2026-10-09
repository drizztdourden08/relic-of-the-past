/* @layer renderer-other @kind logic */
import { deviceKeySlots } from './deviceKeySlots';

const deviceKeyForId = (sdlId: number): string | undefined => deviceKeySlots.byId.get(sdlId)?.deviceKey;

export { deviceKeyForId };
