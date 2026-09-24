/* @layer renderer-components @kind component */
/**
 * A widget's own window: the whole renderer is one Widget shell around the
 * widget's content, fed by the main window over the relay. No game, no title
 * bar, no pages. Closing the shell asks the main process to close the window,
 * which docks the widget back in the main window.
 */
import { useCallback, useMemo } from 'react';
import { Box } from '../../../../design-system/primitives/Box';
import { Widget, getWidgetDefinition, resolveWidgetDisabledState } from '../../../../design-system/composites/Widget';
import { DisabledOverlay } from '../../../../design-system/composites/DisabledOverlay';
import { WIDGET_CONTENT } from '../../../widgets';
import { useWidgetPrefs } from '@app/App/behavior/useWidgetPrefs';
import { hostWidgetId } from '@app/lib/game/widget-data';
import { useHostState } from './behavior/useHostState';
import './WidgetHost.css';

const noop = (): void => {};

const WidgetHost = () => {
  const id = hostWidgetId() ?? '';
  const def = getWidgetDefinition(id);
  const host = useHostState(id);
  useWidgetPrefs(host.profileId);

  const tabs = useMemo(() => [{ id, label: def?.label ?? id }], [id, def]);
  const disabled = resolveWidgetDisabledState(def, host.settings?.vanillaSafe === true, host.settings);
  const handleClose = useCallback(() => window.api.dockBackWidget(id), [id]);

  return (
    <Box className="widget-host">
      <Widget
        id={id}
        tabs={tabs}
        activeId={id}
        paneKey={null}
        opacity={1}
        onActivateTab={noop}
        onOpenOptions={noop}
        onPopOut={noop}
        onClose={handleClose}
      >
        <DisabledOverlay active={disabled !== null} contained message={disabled?.message}>
          {WIDGET_CONTENT[id] ?? null}
        </DisabledOverlay>
      </Widget>
    </Box>
  );
};

export { WidgetHost };
