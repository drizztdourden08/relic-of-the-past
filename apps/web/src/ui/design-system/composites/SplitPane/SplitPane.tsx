/* @layer renderer-components @kind component */
/**
 * Two panes with a draggable divider between them. Dragging a pane below the
 * snap threshold hides it entirely instead of leaving an unusable sliver, so
 * either side can be read at full width.
 *
 * A collapsed pane leaves the divider behind as a labelled rail: clicking it
 * brings the pane back, and so does dragging it out, so the divider is the only
 * control, so there is nothing to hunt for once a pane is gone.
 */
import { Box, Text } from '../../primitives';
import { useSplitPane } from './behavior/useSplitPane';
import type { SplitPaneProps } from './SplitPane.type';
import './SplitPane.css';

const DEFAULT_RATIO = 0.58;
const DEFAULT_SNAP = 0.14;

const SplitPane = (props: SplitPaneProps) => {
  const {
    start, end, defaultRatio = DEFAULT_RATIO, snapAt = DEFAULT_SNAP, defaultCollapsed = 'none',
    startLabel = 'left pane', endLabel = 'right pane', className,
  } = props;

  const {
    trackRef, ratio, collapsed, dragging, expand,
    handlePointerDown, handlePointerMove, endDrag, handleKeyDown,
  } = useSplitPane(defaultRatio, snapAt, defaultCollapsed);

  const startShare = collapsed === 'start' ? 0 : collapsed === 'end' ? 1 : ratio;
  const hidden = collapsed === 'none' ? null : collapsed === 'start' ? startLabel : endLabel;

  return (
    <Box
      ref={trackRef}
      className={`split-pane${dragging ? ' split-pane--dragging' : ''}${className ? ` ${className}` : ''}`}
      style={{ gridTemplateColumns: `minmax(0, ${startShare}fr) auto minmax(0, ${1 - startShare}fr)` }}
    >
      <Box className={`split-pane__pane${collapsed === 'start' ? ' split-pane__pane--hidden' : ''}`}>
        {start}
      </Box>

      <Box
        className={`split-pane__divider split-pane__divider--${collapsed}`}
        role="separator"
        aria-orientation="vertical"
        aria-label={hidden !== null ? `Show ${hidden}` : `Resize ${startLabel} and ${endLabel}`}
        aria-valuenow={Math.round(startShare * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
        onClick={hidden !== null ? expand : undefined}
        onDoubleClick={expand}
        title={hidden !== null ? `Show ${hidden}` : 'Drag to resize · double-click to reset'}
      >
        {hidden !== null
          ? <Text className="split-pane__rail-label">{collapsed === 'start' ? '›' : '‹'} {hidden}</Text>
          : <Box className="split-pane__grip" />}
      </Box>

      <Box className={`split-pane__pane${collapsed === 'end' ? ' split-pane__pane--hidden' : ''}`}>
        {end}
      </Box>
    </Box>
  );
};

export { SplitPane };
