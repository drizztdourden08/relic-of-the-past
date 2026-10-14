/* @layer renderer-components @kind logic */
import { bindMapping } from './bind-mapping';
import { NO_BINDING } from './controls-settings.constants';
import { sameGamepadInput } from './same-gamepad-input';
import type { FunctionMapping } from '@rotp/features';
import type { BindFunctionActionParams } from './controls-settings.type';

const bindFunctionAction = ({ mappings, action, binding, vid, pid }: BindFunctionActionParams): FunctionMapping[] =>
  mappings.map(m => {
    if (m.action === action) return bindMapping({ mapping: m, binding, vid, pid });
    if (sameGamepadInput(m.binding, binding)) return bindMapping({ mapping: m, binding: NO_BINDING, vid: null, pid: null });
    return m;
  });

export { bindFunctionAction };
