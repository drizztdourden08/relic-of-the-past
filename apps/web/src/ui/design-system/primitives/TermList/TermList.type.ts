/* @layer renderer-components @kind types */

/** One line: a short lead-in and the plain text that follows it. */
interface TermListItem {
  term: string;
  detail: string;
}

interface TermListProps {
  items: readonly TermListItem[];
  className?: string;
}

export type { TermListItem, TermListProps };
