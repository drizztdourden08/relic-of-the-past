/* @layer renderer-app @kind hook */
import { useCallback, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { isWidgetOpen, useWidgetLayout } from '@drizztdourden08/tessera/composites';
import { widgetLayoutIO } from '@app/lib/storage/widget-state';
import { useExclusiveInsetsStore } from '@app/stores/exclusive-insets-store';
import { WIDGET_DEFINITIONS } from '@app/App/widgets/widget-definitions.constants';
import { useDevToolsWidgetGate } from '@app/App/behavior/useDevToolsWidgetGate';
import { useWidgetPrefs } from '@app/App/behavior/useWidgetPrefs';
import { useWidgetDisabledGate } from '@app/App/behavior/useWidgetDisabledGate';
import type { PageId } from '@app/App/App.type';
import { insetsOf } from './insets-of';

const useAppWidgets = (profileId: string | null, setActivePage: (page: PageId) => void) => {
  const contentRef: RefObject<HTMLDivElement | null> = useRef(null);
  const widgets = useWidgetLayout({ definitions: WIDGET_DEFINITIONS, profileId, io: widgetLayoutIO, startup: window.api.startup });
  useWidgetPrefs(profileId);
  const developerToolsEnabled = useDevToolsWidgetGate(widgets.layout, widgets.close, window.api.startup.widgets);
  const { resolveDisabled, onOpenSettings } = useWidgetDisabledGate(setActivePage);
  const setInsets = useExclusiveInsetsStore((s) => s.setInsets);

  const onMainRect = useCallback((rect: { x: number; y: number; width: number; height: number } | null) => {
    const box = contentRef.current;
    if (box) setInsets(insetsOf(rect, box.clientWidth, box.clientHeight));
  }, [setInsets]);

  const widgetVisibility = useMemo(
    () => Object.fromEntries(WIDGET_DEFINITIONS.map((d) => [d.id, isWidgetOpen(widgets.layout, d.id)])),
    [widgets.layout],
  );

  return { widgets, contentRef, developerToolsEnabled, resolveDisabled, onOpenSettings, onMainRect, widgetVisibility };
};

export { useAppWidgets };
