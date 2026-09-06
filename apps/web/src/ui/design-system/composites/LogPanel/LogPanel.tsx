/* @layer renderer-components @kind component */
/**
 * Log renderer styled like a code editor: a fixed gutter column, then an
 * indentable content block (type tag + message). Structure and behaviour live
 * here; COLOUR does not — a caller passes a scoping `className` and styles its
 * own `kind` slugs through it (`.sim-log .log-panel__tag--seq { … }`), so each
 * log keeps a palette that means something in its own domain.
 *
 * Only the newest slice is mounted (useLogWindow); older rows load on demand,
 * so a long run stays responsive without discarding its history.
 */
import { useMemo } from 'react';
import { Box, Button, Text } from '../../primitives';
import { useLogWindow } from './behavior/useLogWindow';
import { LogToolbar } from './sub-components/LogToolbar';
import type { LogPanelProps } from './LogPanel.type';
import './LogPanel.css';

const OLDER_CHUNK = 400;

const matchesQuery = (row: { tag: string; message: string }, query: string): boolean =>
  row.message.toLowerCase().includes(query) || row.tag.toLowerCase().includes(query);

const LogPanel = (props: LogPanelProps) => {
  const {
    rows, className, kinds, hidden, onToggleKind, search, onSearchChange,
    copyText, countLabel = 'entries', emptyLabel = 'No entries.', toolbarExtra,
  } = props;

  const shown = useMemo(() => {
    const query = search?.trim().toLowerCase();
    return query ? rows.filter((row) => matchesQuery(row, query)) : rows;
  }, [rows, search]);

  const { scrollRef, shownCount, hiddenOlder, loadOlder, jumpToBottom, handleScroll } = useLogWindow(shown.length);
  const first = shown.length - shownCount;

  return (
    <Box className={`log-panel${className ? ` ${className}` : ''}`}>
      <LogToolbar
        shown={shown.length}
        total={rows.length}
        countLabel={countLabel}
        kinds={kinds}
        hidden={hidden}
        onToggleKind={onToggleKind}
        search={search}
        onSearchChange={onSearchChange}
        copyText={copyText}
        extra={toolbarExtra}
      />
      {shown.length === 0 ? (
        <Box className="log-panel__list log-panel__list--empty">{emptyLabel}</Box>
      ) : (
        <Box className="log-panel__scroll">
          <Box ref={scrollRef} className="log-panel__list" onScroll={handleScroll}>
            {hiddenOlder > 0 && (
              <Box className="log-panel__older">
                <Button variant="tertiary" size="sm" onClick={loadOlder}>
                  ↑ Load {Math.min(OLDER_CHUNK, hiddenOlder)} older
                </Button>
                <Text className="log-panel__older-note">{hiddenOlder} earlier rows hidden</Text>
              </Box>
            )}
            {shown.slice(first).map((row) => {
              const level = row.indent ?? 0;
              return (
                <Box key={row.id} className="log-panel__row">
                  <Text className="log-panel__gutter">{row.gutter}</Text>
                  <Box className={`log-panel__content${level > 0 ? ` log-panel__content--lvl${level}` : ''}`}>
                    <Text className={`log-panel__tag log-panel__tag--${row.kind}`}>{row.tag}</Text>
                    <Text className={`log-panel__msg log-panel__msg--${row.kind}`}>{row.message}</Text>
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Button variant="tertiary" size="sm" className="log-panel__to-bottom" onClick={jumpToBottom}>
            ↓ Newest
          </Button>
        </Box>
      )}
    </Box>
  );
};

export { LogPanel };
