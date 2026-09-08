/* @layer renderer-other @kind hook */
/**
 * A `useState` drop-in whose value belongs to the profile instead of the
 * component. Point it at a widget id and the value survives the widget being
 * unmounted by an open screen, a profile switch and a restart; pass `null` and
 * it degrades to plain local state with no store write and no disk read, the
 * same bargain `useViewState` makes for a composite used without a ViewKey.
 *
 * The value must survive a JSON round-trip. See widget-prefs.ts for why that is
 * the only constraint.
 */
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

  // The cast is the one place the `unknown` storage shape meets a caller's type.
  // A pref written by an older build with a different shape lands here; the widget
  // reads it as T and the next write corrects it.
  const value = widgetId ? ((stored ?? fallback) as T) : local;

  return [value, set] as const;
};

export { useWidgetPref };
