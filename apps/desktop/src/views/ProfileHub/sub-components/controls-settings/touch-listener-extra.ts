/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import type { ListenerExtraContext } from '@drizztdourden08/brock-input/renderer';
import { TouchBindPicker } from '@app/views/TouchBindPicker';

const touchListenerExtra = (ctx: ListenerExtraContext): ReactNode => createElement(TouchBindPicker, { ctx });

export { touchListenerExtra };
