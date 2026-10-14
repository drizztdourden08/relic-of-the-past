/* @layer renderer-components @kind component */
import { Box, Button, ButtonRow, Field, Select, TextInput } from '@drizztdourden08/tessera/primitives';
import { useSetCreateForm } from '../behavior/useSetCreateForm';
import type { SetCreateFormProps } from './SetCreateForm.type';
import './SetCreateForm.css';

const SetCreateForm = (props: SetCreateFormProps) => {
  const form = useSetCreateForm(props);
  const { open, setOpen, id, setId, name, setName, source, setSource, options, reset, blocked } = form;

  if (!open) {
    return (
      <Box className="set-create">
        <Button variant="ghost" size="sm" disabled={props.sets.length === 0} onClick={() => setOpen(true)}>
          New set...
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
          placeholder="Pick a set..."
        />
      </Field>
      <Field label="Id" hint="lowercase letters, digits and dashes">
        <TextInput value={id} onChange={(e) => setId(e.currentTarget.value)} placeholder="us-canon" />
      </Field>
      <Field label="Name">
        <TextInput value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="Canon names" />
      </Field>
      <ButtonRow>
        <Button size="sm" disabled={blocked} onClick={form.handleCreate}>
          Create from base
        </Button>
        <Button variant="ghost" size="sm" disabled={blocked} onClick={form.handleDuplicate}>
          Duplicate
        </Button>
        <Button variant="ghost" size="sm" onClick={reset}>Cancel</Button>
      </ButtonRow>
    </Box>
  );
};

export { SetCreateForm };
