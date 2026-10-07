/* @layer sanctuary-site @kind component */
/** One text entry in a dialog: the name of a view being saved or renamed. */
import { useEffect, useRef, useState } from 'react';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { TextInput } from '@ds/primitives/TextInput';
import { DialogShell } from '@ds/composites/DialogShell';

type NameDialogProps = {
  open: boolean;
  title: string;
  confirmLabel: string;
  initialValue?: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
};

const NameDialog = (props: NameDialogProps) => {
  const { open, title, confirmLabel, initialValue = '', onConfirm, onCancel } = props;
  const [name, setName] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setName(initialValue);
  }, [open, initialValue]);

  const trimmed = name.trim();
  const submit = () => {
    if (trimmed) onConfirm(trimmed);
  };

  const actions = (
    <>
      <Button variant="tertiary" onClick={onCancel}>Cancel</Button>
      <Button variant="primary" disabled={!trimmed} onClick={submit}>{confirmLabel}</Button>
    </>
  );

  return (
    <DialogShell open={open} onClose={onCancel} title={title} actions={actions} initialFocusRef={inputRef}>
      <Field label="Name" htmlFor="view-name">
        <TextInput
          id="view-name"
          ref={inputRef}
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') submit(); }}
        />
      </Field>
    </DialogShell>
  );
};

export { NameDialog };
export type { NameDialogProps };
