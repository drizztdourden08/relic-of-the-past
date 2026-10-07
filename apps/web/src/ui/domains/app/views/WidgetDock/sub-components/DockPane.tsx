/* @layer renderer-components @kind component */
/**
 * One widget shell in the dock, docked or floating: the tabs it carries, the
 * active one's content behind its DisabledOverlay when a setting locks it,
 * and the shell's actions wired to the layout store.
 */
import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { Rect, WidgetId } from '@shared/types/widget-layout';
import { DisabledOverlay } from '@ds/composites/DisabledOverlay';
import { Widget } from '@ds/composites/Widget/Widget';
import { getWidgetDefinition } from '@ds/composites/Widget/behavior/createWidgetState';
import { resolveWidgetDisabledState } from '@ds/composites/Widget/behavior/resolveWidgetDisabledState';
import { frameOf } from '@app/stores/widget-layout-edits';
import { useWidgetLayoutStore } from '@app/stores/widget-layout-store';

interface DockPaneProps {
  /** The widgets tabbed in this shell; one for a floating widget. */
  widgets: WidgetId[];
  activeId: WidgetId;
  /** The pane's key while docked; null while floating. */
  paneKey: string | null;
  content: ReactNode;
  vanillaSafe: boolean;
  settings: GameSettings | null;
  onOpenSettings: (settingId: string) => void;
}

const labelOf = (id: WidgetId): string => getWidgetDefinition(id)?.label ?? id;

const DockPane = (props: DockPaneProps) => {
  const { widgets, activeId, paneKey, content, vanillaSafe, settings, onOpenSettings } = props;
  const opacity = useWidgetLayoutStore((s) => frameOf(s.layout, activeId).opacity);
  const peek = useWidgetLayoutStore((s) => s.peek);
  const optionsOpen = useWidgetLayoutStore((s) => s.optionsFor?.id === activeId);
  const apply = useWidgetLayoutStore((s) => s.apply);
  const close = useWidgetLayoutStore((s) => s.close);
  const popOut = useWidgetLayoutStore((s) => s.popOut);
  const openOptions = useWidgetLayoutStore((s) => s.openOptions);

  const tabs = useMemo(() => widgets.map((id) => ({ id, label: labelOf(id) })), [widgets]);
  const disabled = resolveWidgetDisabledState(getWidgetDefinition(activeId), vanillaSafe, settings);

  const handleActivateTab = useCallback((id: WidgetId) => {
    if (paneKey) apply({ type: 'activate-tab', key: paneKey, id });
  }, [apply, paneKey]);
  const handleOpenOptions = useCallback((anchor: Rect) => openOptions(activeId, anchor), [openOptions, activeId]);
  const handlePopOut = useCallback(() => popOut(activeId), [popOut, activeId]);
  const handleClose = useCallback(() => close(activeId), [close, activeId]);
  const handleOpenSettings = useCallback(
    () => onOpenSettings(disabled?.settingId ?? 'vanillaSafe'),
    [onOpenSettings, disabled?.settingId],
  );

  return (
    <Widget
      id={activeId}
      tabs={tabs}
      activeId={activeId}
      paneKey={paneKey}
      opacity={opacity}
      peek={peek}
      optionsOpen={optionsOpen}
      onActivateTab={handleActivateTab}
      onOpenOptions={handleOpenOptions}
      onPopOut={handlePopOut}
      canPopOut={getWidgetDefinition(activeId)?.popOut === true}
      onClose={handleClose}
    >
      {/* `contained`: the shell clips overflow, so the overlay's default overhang would be cut off. */}
      <DisabledOverlay
        active={disabled != null}
        message={disabled?.message}
        contained
        onOpenSettings={handleOpenSettings}
      >
        {content}
      </DisabledOverlay>
    </Widget>
  );
};

export { DockPane, labelOf };
export type { DockPaneProps };
