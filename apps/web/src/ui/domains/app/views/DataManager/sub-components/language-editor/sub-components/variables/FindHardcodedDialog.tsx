/* @layer renderer-components @kind component */
/**
 * "Find hardcoded names": every place the set spells a name out instead of
 * referencing the variable for it, offered as one decision per name.
 *
 * A variable only earns its keep once the lines that say it point AT it. A
 * reference follows a later rename, literal text does not. The scan itself
 * reports and changes nothing; this dialog is the deliberate step, which is why
 * it opens with everything unticked and states its totals before applying.
 *
 * Near misses are reported and never applied. They matched only with case
 * ignored, and swapping one for a reference would recase a line somebody wrote
 * that way on purpose.
 *
 * The only state held here is which rows are ticked. That selection is thrown
 * away when the dialog closes. Both the scan and the apply belong to the caller.
 */
import { useCallback, useMemo, useState } from 'react';
import { Box, Button, EmptyState, Text } from '@ds/primitives';
import { DialogShell } from '@ds/composites';
import { HardcodedGroupRow } from './HardcodedGroupRow';
import type { HardcodedGroup } from '../../behavior/hardcoded-report';
import './FindHardcodedDialog.css';

type FindHardcodedDialogProps = {
  open: boolean;
  groups: HardcodedGroup[];
  onApply: (variableKeys: string[]) => void;
  onClose: () => void;
};

const NOTHING_FOUND = 'Every name this set knows is already a reference.';

const FindHardcodedDialog = (props: FindHardcodedDialogProps) => {
  const { open, groups, onApply, onClose } = props;

  const [chosen, setChosen] = useState<ReadonlySet<string>>(() => new Set<string>());

  const handleToggle = useCallback((variableKey: string, checked: boolean) => {
    setChosen((current) => {
      const next = new Set(current);
      if (checked) next.add(variableKey);
      else next.delete(variableKey);
      return next;
    });
  }, []);

  const total = useMemo(
    () => groups
      .filter((group) => chosen.has(group.variableKey))
      .reduce((sum, group) => sum + group.exact.length, 0),
    [groups, chosen],
  );

  const handleApply = useCallback(() => {
    onApply([...chosen]);
    setChosen(new Set<string>());
  }, [chosen, onApply]);

  const actions = (
    <>
      <Button variant="tertiary" onClick={onClose}>Close</Button>
      <Button variant="primary" disabled={total === 0} onClick={handleApply}>
        {total === 0 ? 'Retag' : `Retag ${total}`}
      </Button>
    </>
  );

  return (
    <DialogShell open={open} onClose={onClose} title="Find hardcoded names" actions={actions}>
      {groups.length === 0 ? (
        <EmptyState message={NOTHING_FOUND} />
      ) : (
        <Box className="hardcoded-dialog">
          <Text as="p" variant="caption" className="hardcoded-dialog__lead">
            Each name below is written out as plain text somewhere in this set. Retagging
            makes those lines reference the variable instead, so a later rename reaches
            every one of them.
          </Text>
          <Box className="hardcoded-dialog__rows">
            {groups.map((group) => (
              <HardcodedGroupRow
                key={group.variableKey}
                group={group}
                checked={chosen.has(group.variableKey)}
                onToggle={handleToggle}
              />
            ))}
          </Box>
        </Box>
      )}
    </DialogShell>
  );
};

export { FindHardcodedDialog };
export type { FindHardcodedDialogProps };
