/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import type { I18n, Text } from '@drizztdourden08/brock-core/i18n';
import type { ListenerExtraContext } from '@drizztdourden08/brock-input/renderer';
import { TouchBindPicker } from '@app/views/TouchBindPicker';
import { touchActionLabel } from './touch-action-label';

const touchListenerExtra = (t: I18n['t'], text: (text: Text) => string) => (ctx: ListenerExtraContext): ReactNode =>
  createElement(TouchBindPicker, { ctx, actionLabel: touchActionLabel(ctx.target, t, text) });

export { touchListenerExtra };
