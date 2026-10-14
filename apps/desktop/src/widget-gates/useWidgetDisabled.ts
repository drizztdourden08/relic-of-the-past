/* @layer renderer-appshell @kind hook */
import { useCallback } from 'react';
import { useSettings } from '@drizztdourden08/brock-react';
import type { WidgetDisabledHook } from '@drizztdourden08/brock-react';
import type { AppSettings } from '@app/settings.type';
import { resolveWidgetDisabledState } from './resolve-widget-disabled-state';
import { WIDGET_GATES } from './widget-gates.constants';

const useWidgetDisabled: WidgetDisabledHook = () => {
  const { settings } = useSettings<AppSettings>();
  return useCallback((id: string) => {
    const gate = WIDGET_GATES[id];
    return gate ? resolveWidgetDisabledState(gate, settings) : null;
  }, [settings]);
};

export { useWidgetDisabled };
