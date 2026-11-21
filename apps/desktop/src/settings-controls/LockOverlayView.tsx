/* @layer renderer-app @kind component */
import { useText } from '@drizztdourden08/brock-react';
import type { LockOverlayProps } from '@drizztdourden08/brock-react';
import { DisabledOverlay } from '@drizztdourden08/tessera/composites';
import { openSetting } from '@app/settings-nav/open-setting';
import { DISABLED_SETTING_MESSAGES } from './disabled-setting-messages.constants';

const openVanillaSafe = (): void => openSetting('vanillaSafe');

const LockOverlayView = (props: LockOverlayProps) => {
  const { cause, children } = props;
  const text = useText();
  return (
    <DisabledOverlay
      active
      contained
      message={text(DISABLED_SETTING_MESSAGES[cause] ?? cause)}
      onOpenSettings={cause === 'vanillaSafe' ? openVanillaSafe : undefined}
    >
      {children}
    </DisabledOverlay>
  );
};

export { LockOverlayView };
