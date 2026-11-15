/* @layer renderer-components @kind component */
import { Box, Button, ButtonRow, DropZone, Field, Select, Text, TextInput, Textarea } from '@drizztdourden08/tessera/primitives';
import { usePatchedImportForm } from './behavior/usePatchedImportForm';
import { RELEASE_OPTIONS, ROM_ACCEPT } from './PatchedImportForm.constants';
import type { PatchedImportFormProps } from './PatchedImportForm.type';
import './PatchedImportForm.css';

const PatchedImportForm = (props: PatchedImportFormProps) => {
  const { busy, error } = props;
  const form = usePatchedImportForm(props);
  const { open, setOpen, name, setName, base, pickBase, credits, setCredits, file, pickFile, blocked } = form;

  if (!open) {
    return (
      <Box className="patched-import">
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>Import patched ROM...</Button>
      </Box>
    );
  }

  const chosen = file === null ? undefined : { tone: 'success' as const, message: file.name };

  return (
    <Box className="patched-import patched-import--open">
      <Field label="Name" hint="The set id is made from the name">
        <TextInput value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="Italian fan translation" />
      </Field>
      <Field label="Based on" hint="The release the fan patch was applied to">
        <Select value={base} onChange={pickBase} options={[...RELEASE_OPTIONS]} />
      </Field>
      <Field label="Credits" hint="Optional: who made the translation">
        <Textarea value={credits} onChange={(e) => setCredits(e.currentTarget.value)} rows={2} resize="vertical" />
      </Field>
      <Field label="ROM file">
        <DropZone
          accept={ROM_ACCEPT}
          variant="inline"
          label="Drop the patched ROM"
          hint="The ROM is read, never saved."
          disabled={busy}
          status={chosen}
          onDrop={pickFile}
        />
      </Field>
      {error !== null && <Text variant="caption" tone="danger" role="alert">{error}</Text>}
      <ButtonRow>
        <Button size="sm" loading={busy} disabled={blocked} onClick={form.submit}>Import</Button>
        <Button variant="ghost" size="sm" disabled={busy} onClick={form.reset}>Cancel</Button>
      </ButtonRow>
    </Box>
  );
};

export { PatchedImportForm };
