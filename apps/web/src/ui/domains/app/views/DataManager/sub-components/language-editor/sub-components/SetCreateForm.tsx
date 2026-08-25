/* @layer renderer-components @kind component */
/**
 * Starts a new language set, either from a base language's text or as a copy of
 * an existing set. Collapsed until asked for, so the set list stays the first
 * thing in the pane.
 */
import { useCallback, useMemo, useState } from 'react';
import { Box, Button, ButtonRow, Field, Select, TextInput } from '@ds/primitives';
import type { LanguageSetSummary } from '@shared/storage/languages';
import './SetCreateForm.css';

type SetCreateFormProps = {
  sets: LanguageSetSummary[];
  busy?: boolean;
  onCreate: (id: string, name: string, base: string) => void;
  onDuplicate: (sourceId: string, id: string, name: string) => void;
};

const SetCreateForm = (props: SetCreateFormProps) => {
  const { sets, busy, onCreate, onDuplicate } = props;
  const [open, setOpen] = useState(false);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [source, setSource] = useState('');

  const options = useMemo(
    () => sets.map((set) => ({ value: set.id, label: `${set.name} (${set.id})` })),
    [sets],
  );

  const reset = useCallback(() => {
    setId('');
    setName('');
    setOpen(false);
  }, []);

  const handleCreate = useCallback(() => {
    if (!id || !name || !source) return;
    onCreate(id, name, source);
    reset();
  }, [id, name, source, onCreate, reset]);

  const handleDuplicate = useCallback(() => {
    if (!id || !name || !source) return;
    onDuplicate(source, id, name);
    reset();
  }, [id, name, source, onDuplicate, reset]);

  if (!open) {
    return (
      <Box className="set-create">
        <Button variant="ghost" size="sm" disabled={sets.length === 0} onClick={() => setOpen(true)}>
          New set…
        </Button>
      </Box>
    );
  }

  return (
    <Box className="set-create set-create--open">
      <Field label="Based on">
        <Select
          value={source}
          onChange={setSource}
          options={options}
          placeholder="Pick a set…"
        />
      </Field>
      <Field label="Id" hint="lowercase letters, digits and dashes">
        <TextInput value={id} onChange={(e) => setId(e.currentTarget.value)} placeholder="us-canon" />
      </Field>
      <Field label="Name">
        <TextInput value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="Canon names" />
      </Field>
      <ButtonRow>
        <Button size="sm" disabled={busy || !id || !name || !source} onClick={handleCreate}>
          Create from base
        </Button>
        <Button variant="ghost" size="sm" disabled={busy || !id || !name || !source} onClick={handleDuplicate}>
          Duplicate
        </Button>
        <Button variant="ghost" size="sm" onClick={reset}>Cancel</Button>
      </ButtonRow>
    </Box>
  );
};

export { SetCreateForm };
export type { SetCreateFormProps };
