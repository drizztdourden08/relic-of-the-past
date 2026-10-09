/* @layer renderer-other @kind hook */
import { useCallback, useState } from 'react';
import { useWidgetUiStore } from '@app/stores/widget-ui-store';

const useWidgetPref = <T,>(
  widgetId: string | null,
  key: string,
  fallback: T,
): readonly [T, (next: T) => void] => {
  const [local, setLocal] = useState<T>(fallback);
  const stored = useWidgetUiStore((s) => (widgetId ? s.byWidget[widgetId]?.[key] : undefined));
  const setPref = useWidgetUiStore((s) => s.setPref);

  const set = useCallback((next: T) => {
    if (widgetId) setPref(widgetId, key, next);
    else setLocal(next);
  }, [widgetId, key, setPref]);

  const value = widgetId ? ((stored ?? fallback) as T) : local;

  return [value, set] as const;
};

export { useWidgetPref };
