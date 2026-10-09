/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import { ScrollArea, Text, TextInput } from '@ds/primitives';
import { PopoverShell } from './PopoverShell';
import { VariableChoice } from './VariableChoice';
import { filterVariables } from '@domains/packs/language/compounds/variables/variable-groups';
import { tokenForVariable } from '../../sub-components/variables/variable-token';
import type { ChangeEvent, KeyboardEvent } from 'react';
import type { Variable } from '@shared/game/language';
import type { VariablePopoverProps } from './VariablePopover.type';
import './VariablePopover.css';

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
