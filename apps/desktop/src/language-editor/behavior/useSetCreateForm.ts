/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import type { SetCreateFormProps } from '../sub-components/SetCreateForm.type';

const useSetCreateForm = (props: SetCreateFormProps) => {
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

  const incomplete = !id || !name || !source;

  const handleCreate = useCallback(() => {
    if (incomplete) return;
    onCreate(id, name, source);
    reset();
  }, [incomplete, id, name, source, onCreate, reset]);

  const handleDuplicate = useCallback(() => {
    if (incomplete) return;
    onDuplicate(source, id, name);
    reset();
  }, [incomplete, id, name, source, onDuplicate, reset]);

  return {
    open, setOpen, id, setId, name, setName, source, setSource, options, reset,
    handleCreate, handleDuplicate, blocked: Boolean(busy) || incomplete,
  };
};

export { useSetCreateForm };
