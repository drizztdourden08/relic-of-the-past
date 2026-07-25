/* @layer renderer-widgets @kind component */
/**
 * Simulation-log renderer, styled like a code editor: a fixed line-number
 * gutter, then an indentable content block (coloured type tag + message). Line
 * numbers are the event's real position in the run (1..N), NOT the engine step
 * (which repeats). Three indent levels: "Sequence <phase>" markers at the base,
 * "Screen X"/"Exiting X" one level in, and everything inside a screen two levels
 * in with a guide.
 *
 * Only the newest slice is mounted (useLogWindow); older events load on demand,
 * so a long run stays responsive without discarding its history.
 */
import { useMemo } from 'react';
import { Box, Text, Button } from '@ds/primitives';
import type { SimEvent } from '@shared/game/simulation';
import { classifyEvent, computeIndents } from './log-event-style';
import type { LogKind } from './log-event-style';
import { useLogWindow } from '../behavior/useLogWindow';
import './SimLog.css';

interface LogViewProps {
  events: SimEvent[];
  /** Event kinds to hide (from the filter dropdown). */
  hidden?: Set<LogKind>;
}

const LogView = (props: LogViewProps) => {
  const { events, hidden } = props;

  const shown = useMemo(
    () => (hidden && hidden.size > 0 ? events.filter((e) => !hidden.has(classifyEvent(e).kind)) : events),
    [events, hidden],
  );
  // Indents are computed over the WHOLE filtered list: the level of a row
  // depends on the markers before it, which may sit outside the window.
  const indents = useMemo(() => computeIndents(shown), [shown]);
  const { scrollRef, shownCount, hiddenOlder, loadOlder, jumpToBottom, handleScroll } = useLogWindow(shown.length);

  if (shown.length === 0) return <Box className="sim-log sim-log--empty">No events.</Box>;

  const first = shown.length - shownCount;

  return (
    <Box className="sim-log-scroll">
      <Box ref={scrollRef} className="sim-log" onScroll={handleScroll}>
        {hiddenOlder > 0 && (
          <Box className="sim-log__older">
            <Button variant="tertiary" size="sm" onClick={loadOlder}>
              ↑ Load {Math.min(400, hiddenOlder)} older
            </Button>
            <Text className="sim-log__older-note">{hiddenOlder} earlier events hidden</Text>
          </Box>
        )}
        {shown.slice(first).map((event, i) => {
          const idx = first + i;
          const { kind, tag } = classifyEvent(event);
          const lvl = indents[idx];
          // Position rows: the tag already says START/END — show just "at x,y".
          const msg = kind === 'pos' ? event.msg.replace(/^(START|END) /, '') : event.msg;
          return (
            <Box key={`${event.step}-${idx}`} className="sim-log__row">
              <Text className="sim-log__ln">{idx + 1}</Text>
              <Box className={`sim-log__content${lvl > 0 ? ` sim-log__content--lvl${lvl}` : ''}`}>
                <Text className={`sim-log__tag sim-log__tag--${kind}`}>{tag}</Text>
                <Text className={`sim-log__msg sim-log__msg--${kind}`}>{msg}</Text>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Button variant="tertiary" size="sm" className="sim-log__to-bottom" onClick={jumpToBottom}>↓ Newest</Button>
    </Box>
  );
};

export { LogView };
