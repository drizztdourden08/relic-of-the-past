/* @layer renderer-components @kind logic */
import { keyboardModernBindings } from '@rotp/input-mapping';

const keyboardSlots = () => keyboardModernBindings().slots;

export { keyboardSlots };
