/* @layer renderer-components @kind component */
/**
 * The panel's header strip: how many rows are in view, the standard FilterBar
 * (its built-in free-text search plus a show/hide type facet), copy-all, and a
 * caller slot. Every control is optional — a panel given none of them renders
 * no toolbar at all.
 */
import { useCallback, useMemo, useState } from 'react';
import { Box, Button, Text } from '../../../primitives';
import { FacetPicker, FilterBar } from '../../FilterBar';
import type { FilterFacet } from '../../FilterBar';
import type { LogKindDef } from '../LogPanel.type';
import type { ReactNode } from 'react';

interface LogToolbarProps {
  shown: number;
  total: number;
  countLabel: string;
  kinds?: readonly LogKindDef[];
  hidden?: ReadonlySet<string>;
  onToggleKind?: (kind: string) => void;
  search?: string;
  onSearchChange?: (query: string) => void;
  copyText?: () => string;
  extra?: ReactNode;
}

const COPIED_MS = 1500;
const KIND_FACET_LABEL = 'Show types';

const LogToolbar = (props: LogToolbarProps) => {
  const { shown, total, countLabel, kinds, hidden, onToggleKind, search, onSearchChange, copyText, extra } = props;
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!copyText) return;
    void navigator.clipboard?.writeText(copyText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_MS);
    });
  }, [copyText]);

  const showFilter = kinds !== undefined && hidden !== undefined && onToggleKind !== undefined;
  const facets = useMemo<FilterFacet[] | undefined>(() => (
    showFilter
      ? [{ id: 'kinds', label: KIND_FACET_LABEL, options: kinds, hidden, onToggle: onToggleKind }]
      : undefined
  ), [showFilter, kinds, hidden, onToggleKind]);

  if (!showFilter && onSearchChange === undefined && copyText === undefined && extra === undefined) return null;

  return (
    <Box className="log-panel__toolbar">
      <Text className="log-panel__count">
        {shown === total ? `${total} ${countLabel}` : `${shown} of ${total} ${countLabel}`}
      </Text>
      {onSearchChange !== undefined ? (
        <FilterBar
          className="log-panel__filter-bar"
          search={search ?? ''}
          onSearchChange={onSearchChange}
          searchPlaceholder="Filter…"
          searchLabel="Filter the log"
          facets={facets}
        />
      ) : (
        facets?.map((facet) => <FacetPicker key={facet.id} facet={facet} />)
      )}
      {extra}
      {copyText !== undefined && (
        <Button variant="tertiary" size="sm" className="log-panel__copy" onClick={handleCopy} disabled={total === 0}>
          {copied ? '✓ Copied' : '⧉ Copy all'}
        </Button>
      )}
    </Box>
  );
};

export { LogToolbar };
export type { LogToolbarProps };
