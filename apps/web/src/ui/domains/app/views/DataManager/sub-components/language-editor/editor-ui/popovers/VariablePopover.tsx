/* @layer renderer-components @kind component */
/**
 * The variable list: everything a line can hold that stands in for text the set
 * does not spell out.
 *
 * A filter, not sections. A set can carry a hundred menu names, and a
 * translator reaching for one knows its word, not which family it belongs to.
 * The field therefore takes focus on open and typing narrows the list. Enter takes the
 * first row, which is the whole gesture for a name that is already unique.
 *
 * Which token a row inserts is not decided here: a variable the engine owns has
 * to stay a control code all the way into the packed dialogue, and everything
 * else becomes a reference that survives a later rename. `tokenForVariable` is
 * the one place that choice is made.
 */
import { useCallback, useMemo, useState } from 'react';
import { ScrollArea, Text, TextInput } from '@ds/primitives';
import { PopoverShell } from './PopoverShell';
import { VariableChoice } from './VariableChoice';
import { filterVariables } from '../../sub-components/variables/variable-groups';
import { tokenForVariable } from '../../sub-components/variables/variable-token';
import type { ChangeEvent, KeyboardEvent } from 'react';
import type { Token, Variable } from '@shared/game/language';
import './VariablePopover.css';

type VariablePopoverProps = {
  label: string;
  variables: Variable[];
  onInsert: (tokens: Token[]) => void;
};

const VariablePopover = (props: VariablePopoverProps) => {
  const { label, variables, onInsert } = props;
  const [query, setQuery] = useState('');

  const rows = useMemo(() => filterVariables(variables, 'all', query), [variables, query]);

  const handleQuery = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.currentTarget.value);
  }, []);

  const handlePick = useCallback((variable: Variable) => {
    const token = tokenForVariable(variable);
    if (token === null) return;
    onInsert([token]);
  }, [onInsert]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const first = rows[0];
    if (first !== undefined) handlePick(first);
  }, [rows, handlePick]);

  return (
    <PopoverShell label={label}>
      <TextInput
        className="variable-popover__filter"
        value={query}
        placeholder="Filter..."
        aria-label="Filter variables"
        autoFocus
        onChange={handleQuery}
        onKeyDown={handleKeyDown}
      />
      <ScrollArea className="variable-popover__list">
        {rows.length === 0 ? (
          <Text as="span" variant="caption" className="popover-shell__empty">No match</Text>
        ) : null}
        {rows.map((variable) => (
          <VariableChoice key={variable.key} variable={variable} onPick={handlePick} />
        ))}
      </ScrollArea>
    </PopoverShell>
  );
};

export { VariablePopover };
export type { VariablePopoverProps };
