/* @layer renderer-components @kind types */
/**
 * The neutral row model every log source is adapted into. The panel knows
 * nothing about simulation events or log-bus entries, so a caller classifies its
 * own records into rows, and styles its own `kind` slugs through a scoping
 * `className` (see LogPanel.css).
 */
import type { ReactNode } from 'react';

interface LogRow {
  id: string;
  /** Left gutter: a line number, a clock time, whatever the source counts by. */
  gutter: string;
  /** Short type marker rendered in its own column. */
  tag: string;
  /** Style + filter key. Drives `log-panel__tag--<kind>` / `__msg--<kind>`. */
  kind: string;
  message: string;
  /** 0-3. Renders the guide rails; levels 2 and 3 carry a vertical border. */
  indent?: number;
}

/** One entry of the show/hide type filter. */
interface LogKindDef {
  id: string;
  label: string;
}

interface LogPanelProps {
  /**
   * Rows to render, ALREADY filtered by `hidden`. Kind filtering belongs to the
   * caller because hiding a row can change how the rows under it are indented,
   * which only the caller's classifier knows. The panel applies `search` only.
   */
  rows: LogRow[];
  /** Scoping class for the caller's own kind palette. */
  className?: string;
  /** Omit to hide the type filter entirely. */
  kinds?: readonly LogKindDef[];
  hidden?: ReadonlySet<string>;
  onToggleKind?: (kind: string) => void;
  /** Omit `onSearchChange` to hide the search box. */
  search?: string;
  onSearchChange?: (query: string) => void;
  /** Omit to hide the copy button. Returns the whole log as plain text. */
  copyText?: () => string;
  /** Noun used in the toolbar count, e.g. 'events'. */
  countLabel?: string;
  emptyLabel?: string;
  /** Rendered at the end of the toolbar, before the filter. */
  toolbarExtra?: ReactNode;
}

export type { LogKindDef, LogPanelProps, LogRow };
