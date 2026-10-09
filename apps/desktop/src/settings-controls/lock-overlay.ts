/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { DisabledOverlay } from '@drizztdourden08/tessera/composites';
import type { LockOverlayProps } from '@drizztdourden08/brock-react';
import { DISABLED_SETTING_MESSAGES } from '@domains/app/disabled-setting-messages.constants';
import { openSetting } from '@app/settings-nav/open-setting';

const openVanillaSafe = (): void => openSetting('vanillaSafe');

const lockOverlay = (props: LockOverlayProps): ReactNode => {
  const { cause, children } = props;
  return createElement(DisabledOverlay, {
    active: true,
    contained: true,
    message: DISABLED_SETTING_MESSAGES[cause] ?? cause,
    onOpenSettings: cause === 'vanillaSafe' ? openVanillaSafe : undefined,
    children,
  });
};

export { lockOverlay };
