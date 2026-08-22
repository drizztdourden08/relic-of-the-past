/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import { Badge } from '@ds/primitives/Badge';
import { Button } from '@ds/primitives/Button';
import { IconButton } from '@ds/primitives/IconButton';
import { SectionHeader } from '@ds/primitives/SectionHeader';
import { EmptyState } from '@ds/primitives/EmptyState';
import type { GlossaryTerm } from '@shared/game/language/types';
import './EditableTables.css';

/** Tooltip for the link action, so the case policy is never a silent skip. */
const linkHint = (value: string, targets: number, misses: number): string => {
  const head = `Turn ${targets} plain-text occurrence(s) of "${value}" into references to this term`;
  return misses === 0 ? head : `${head}. ${misses} more differ in case and stay as plain text`;
};

const GlossaryTable = (props: GlossaryTableProps) => {
  const {
    terms, refCounts, linkTargets, caseMisses, onChange, onAdd, onLink, onRemove,
    readOnly = false,
  } = props;
  const [draftKey, setDraftKey] = useState('');
  const [draftValue, setDraftValue] = useState('');

  const canAdd = draftKey.trim().length > 0 && draftValue.trim().length > 0;

  const handleAdd = useCallback(() => {
    if (!onAdd || !canAdd) return;
    onAdd({ key: draftKey.trim(), value: draftValue.trim() });
    setDraftKey('');
    setDraftValue('');
  }, [onAdd, canAdd, draftKey, draftValue]);

  return (
    <Box className="glossary-table">
      <SectionHeader title="Glossary" subtitle={`${terms.length} terms`} />
      <Box className="glossary-table__rows">
        {terms.length === 0 && <EmptyState message="No glossary terms yet" />}
        {terms.map((term) => {
          const count = refCounts?.[term.key];
          const targets = linkTargets?.[term.key] ?? 0;
          const misses = caseMisses?.[term.key] ?? 0;
          const canLink = onLink && !readOnly && targets > 0;
          return (
            <Box key={term.key} className="glossary-table__row">
              <Box className="glossary-table__key">
                <Text className="glossary-table__key-text">{term.key}</Text>
                {count != null && (
                  <Badge variant="neutral" className="glossary-table__count">{count}×</Badge>
                )}
              </Box>
              <TextInput
                className="glossary-table__value"
                value={term.value}
                disabled={readOnly}
                onChange={(e) => onChange(term.key, e.currentTarget.value)}
              />
              {canLink && (
                <Button
                  variant="tertiary"
                  size="sm"
                  title={linkHint(term.value, targets, misses)}
                  onClick={() => onLink(term.key)}
                >
                  {`Link ${targets}`}
                </Button>
              )}
              {!canLink && misses > 0 && (
                <Text variant="caption">{`${misses} differ in case`}</Text>
              )}
              {onRemove && !readOnly && (
                <IconButton
                  variant="danger"
                  size="sm"
                  label={`Remove ${term.key}`}
                  className="glossary-table__remove"
                  onClick={() => onRemove(term.key)}
                >
                  ✕
                </IconButton>
              )}
            </Box>
          );
        })}
      </Box>

      {onAdd && !readOnly && (
        <Box className="glossary-table__add">
          <TextInput
            className="glossary-table__add-key"
            placeholder="key"
            value={draftKey}
            onChange={(e) => setDraftKey(e.currentTarget.value)}
          />
          <TextInput
            className="glossary-table__add-value"
            placeholder="value"
            value={draftValue}
            onChange={(e) => setDraftValue(e.currentTarget.value)}
          />
          <Button variant="secondary" size="sm" onClick={handleAdd} disabled={!canAdd}>
            Add
          </Button>
        </Box>
      )}
    </Box>
  );
};

type GlossaryTableProps = {
  terms: GlossaryTerm[];
  /** How many dialogue entries reference each key. */
  refCounts?: Record<string, number>;
  /**
   * Plain-text occurrences of each term's value that could still become
   * references — the count the link action offers to convert.
   */
  linkTargets?: Record<string, number>;
  /**
   * Occurrences that match a term's value only when case is ignored. These are
   * never linked (a ref would rewrite their casing), so they are shown rather
   * than dropped.
   */
  caseMisses?: Record<string, number>;
  onChange: (key: string, value: string) => void;
  onAdd?: (term: GlossaryTerm) => void;
  /** Convert every linkable occurrence of this term into ref tokens. */
  onLink?: (key: string) => void;
  onRemove?: (key: string) => void;
  readOnly?: boolean;
};

export { GlossaryTable };
export type { GlossaryTableProps };
