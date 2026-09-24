/* @layer renderer-components @kind component */
/**
 * The frame every widget wears: a title bar that the dock drags it by, tab
 * chips when its pane holds several, the pop-out, options and close buttons,
 * and a scrolling body. It fills whatever box the dock or the window gives
 * it; where it sits and how big it is are not its business.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Box } from '../../primitives/Box';
import { Button } from '../../primitives/Button';
import { Text } from '../../primitives/Text';
import type { WidgetProps, WidgetTab } from './Widget.type';
import './Widget.css';

interface TabChipProps {
  tab: WidgetTab;
  active: boolean;
  onActivate: (id: string) => void;
}

const TITLEBAR_HINT = 'Drag to move. Hold Alt to peek at the game. While dragging: Shift swaps, Ctrl overlays, Esc cancels, past the window edge pops out.';

const TabChip = (props: TabChipProps) => {
  const { tab, active, onActivate } = props;
  const handleClick = useCallback(() => onActivate(tab.id), [onActivate, tab.id]);
  return (
    <Button
      variant="bare"
      className={`widget__tab${active ? ' widget__tab--active' : ''}`}
      data-drag-tab={tab.id}
      aria-pressed={active}
      onClick={handleClick}
    >
      {tab.label}
    </Button>
  );
};

const Widget = (props: WidgetProps) => {
  const {
    id, tabs, activeId, paneKey, opacity, peek = false, optionsOpen = false,
    onActivateTab, onOpenOptions, onPopOut, canPopOut = true, onClose, children,
  } = props;
  const [hovered, setHovered] = useState(false);
  const gearRef = useRef<HTMLButtonElement>(null);

  const frameOpacity = hovered ? 1 : opacity;
  const style = useMemo(
    () => ({ '--widget-frame-opacity': frameOpacity }) as CSSProperties,
    [frameOpacity],
  );

  const handleEnter = useCallback(() => setHovered(true), []);
  const handleLeave = useCallback(() => setHovered(false), []);
  const handleOptions = useCallback(() => {
    const box = gearRef.current?.getBoundingClientRect();
    if (box) onOpenOptions({ x: box.left, y: box.top, width: box.width, height: box.height });
  }, [onOpenOptions]);

  const label = tabs.find((tab) => tab.id === activeId)?.label ?? tabs[0]?.label ?? id;
  const cls = ['widget', peek && 'widget--peek', paneKey === null && 'widget--floating'].filter(Boolean).join(' ');

  return (
    <Box
      className={cls}
      style={style}
      data-widget-id={id}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Box
        className="widget__titlebar"
        data-drag-widget={activeId}
        data-pane-key={paneKey ?? ''}
        title={TITLEBAR_HINT}
      >
        {tabs.length > 1 ? (
          <Box className="widget__tabs">
            {tabs.map((tab) => (
              <TabChip key={tab.id} tab={tab} active={tab.id === activeId} onActivate={onActivateTab} />
            ))}
          </Box>
        ) : (
          <Text className="widget__title">{label}</Text>
        )}
        <Box className="widget__titlebar-actions">
          {canPopOut && <Button variant="bare" className="widget__btn" onClick={onPopOut} title="Pop out">{'⤢'}</Button>}
          <Button
            variant="bare"
            ref={gearRef}
            className="widget__btn"
            active={optionsOpen}
            onClick={handleOptions}
            title="Options"
          >{'⚙'}</Button>
          <Button variant="bare" className="widget__btn" onClick={onClose} title="Close">{'×'}</Button>
        </Box>
      </Box>
      {!peek && (
        <Box className="widget__content">
          {children}
        </Box>
      )}
    </Box>
  );
};

export { Widget };
