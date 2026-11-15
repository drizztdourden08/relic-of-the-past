/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import type { RomLanguage } from '@rotp/asset-extraction';
import { DEFAULT_BASE } from '../PatchedImportForm.constants';
import type { PatchedImportFormProps } from '../PatchedImportForm.type';

const usePatchedImportForm = (props: PatchedImportFormProps) => {
  const { busy, onImport } = props;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [base, setBase] = useState<RomLanguage>(DEFAULT_BASE);
  const [credits, setCredits] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const reset = useCallback(() => {
    setName('');
    setBase(DEFAULT_BASE);
    setCredits('');
    setFile(null);
    setOpen(false);
  }, []);

  const pickBase = useCallback((value: string) => setBase(value as RomLanguage), []);
  const pickFile = useCallback((files: File[]) => setFile(files[0] ?? null), []);

  const blocked = busy || !name.trim() || file === null;

  const submit = useCallback(async () => {
    if (blocked || file === null) return;
    if (await onImport({ name, base, credits, file })) reset();
  }, [blocked, name, base, credits, file, onImport, reset]);

  return { open, setOpen, name, setName, base, pickBase, credits, setCredits, file, pickFile, blocked, submit, reset };
};

export { usePatchedImportForm };
