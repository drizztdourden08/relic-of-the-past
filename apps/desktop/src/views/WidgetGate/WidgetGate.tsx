/* @layer renderer-app @kind component */
import { useSettings } from '@drizztdourden08/brock-react';
import { DisabledOverlay } from '@drizztdourden08/tessera/composites';
import { WIDGET_GATES } from '@app/widget-gates/widget-gates.constants';
import { resolveWidgetDisabledState } from '@app/widget-gates/resolve-widget-disabled-state';
import { openSetting } from '@app/settings-nav/open-setting';
import type { AppSettings } from '@app/settings.type';
import { OPEN_SETTINGS_LABEL } from './WidgetGate.constants';
import type { WidgetGateProps } from './WidgetGate.type';

const WidgetGate = (props: WidgetGateProps) => {
  const { id, children } = props;
  const { settings } = useSettings<AppSettings>();
  const gate = WIDGET_GATES[id];
  const disabled = gate ? resolveWidgetDisabledState(gate, settings) : null;
  return (
    <DisabledOverlay
      active={disabled !== null}
      message={disabled?.message}
      contained
      actionLabel={OPEN_SETTINGS_LABEL}
      onOpenSettings={disabled ? () => openSetting(disabled.settingId) : undefined}
    >
      {children}
    </DisabledOverlay>
  );
};

export { WidgetGate };
