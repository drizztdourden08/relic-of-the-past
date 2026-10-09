/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { OnlineSessionToggle } from './OnlineSessionToggle';
import { SESSION_ITEMS } from './online-rows.constants';
import type { ControlContext } from '../settings-controls.type';
import type { SessionSwitchKey } from './online.type';

const isSessionKey = (key: string): key is SessionSwitchKey => key in SESSION_ITEMS;

const renderOnlineControl = (key: string, ctx: ControlContext): ReactNode | null =>
  (isSessionKey(key) ? createElement(OnlineSessionToggle, { settingKey: key, disabled: ctx.disabled }) : null);

export { renderOnlineControl };
