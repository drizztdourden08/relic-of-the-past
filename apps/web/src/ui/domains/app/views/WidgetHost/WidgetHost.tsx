/* @layer renderer-components @kind component */
/**
 * A widget's own window: the whole renderer is one Widget shell around the
 * widget's content, fed by the main window over the relay. No game, no title
 * bar, no pages. The shell wears its window mode: a pin, a pop-in button and
 * a working options panel. Closing the shell asks the main process to close
 * the window, which puts the widget back in the main window.
 */
import { useCallback, useMemo, useState } from 'react';
import type { Rect } from '@shared/types/widget-layout';
import { Box } from '../../../../design-system/primitives/Box';
import { Widget, getWidgetDefinition, resolveWidgetDisabledState } from '../../../../design-system/composites/Widget';
import { DisabledOverlay } from '../../../../design-system/composites/DisabledOverlay';
import { WIDGET_CONTENT } from '../../../widgets';
import { useWidgetPrefs } from '@app/App/behavior/useWidgetPrefs';
import { hostWidgetId } from '@app/lib/game/widget-data';
import { useHostState } from './behavior/useHostState';
import { usePoppedWindow } from './behavior/usePoppedWindow';
import { PoppedOptionsHost } from './sub-components/PoppedOptionsHost';
import './WidgetHost.css';

const noop = (): void => {};
const DEFAULT_FRAME = { opacity: 0.92, show: 'always' } as const;

const WidgetHost = () => {
  const id = hostWidgetId() ?? '';
  const def = getWidgetDefinition(id);
  const host = useHostState(id);
  const own = usePoppedWindow(id);
  const [optionsAnchor, setOptionsAnchor] = useState<Rect | null>(null);
  useWidgetPrefs(host.profileId);

  const title = def?.label ?? id;
  const tabs = useMemo(() => [{ id, label: title }], [id, title]);
  const frame = { ...DEFAULT_FRAME, ...host.frames[id] };
  const disabled = resolveWidgetDisabledState(def, host.settings?.vanillaSafe === true, host.settings);
  const handleClose = useCallback(() => window.api.dockBackWidget(id), [id]);
  const handlePopIn = useCallback(() => window.api.dockBackWidget(id), [id]);
  const closeOptions = useCallback(() => setOptionsAnchor(null), []);

  return (
    <Box className="widget-host">
      <Widget
        id={id}
        tabs={tabs}
        activeId={id}
        paneKey={null}
        mode="out"
        opacity={frame.opacity}
        optionsOpen={optionsAnchor !== null}
        pin={own.pin}
        onTop={own.onTop}
        onPinChange={own.setPin}
        onActivateTab={noop}
        onOpenOptions={setOptionsAnchor}
        onPopOut={handlePopIn}
        onClose={handleClose}
      >
        <DisabledOverlay active={disabled !== null} contained message={disabled?.message}>
          {WIDGET_CONTENT[id] ?? null}
        </DisabledOverlay>
      </Widget>
      {optionsAnchor && (
        <PoppedOptionsHost
          id={id}
          title={title}
          anchor={optionsAnchor}
          frame={frame}
          pin={own.pin}
          snap={own.snap}
          onPinChange={own.setPin}
          onSnapChange={own.setSnap}
          onClose={closeOptions}
        />
      )}
    </Box>
  );
};

export { WidgetHost };
