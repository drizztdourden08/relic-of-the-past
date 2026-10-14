/* @layer sanctuary-site @kind hook */
import { useEffect, useState } from 'react';
import type { FileType } from '@rotp/hub-contracts';
import type { UploadMeta } from '../../../upload/upload-target.type';

const useUploadForm = (open: boolean, defaultType: FileType, onConfirm: (meta: UploadMeta) => void) => {
  const [type, setType] = useState<FileType>(defaultType);
  const [tags, setTags] = useState<readonly string[]>([]);
  const [version, setVersion] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    setType(defaultType);
    setTags([]);
    setVersion('');
    setNote('');
  }, [open, defaultType]);

  const confirm = () => onConfirm({
    type,
    tags: [...tags],
    version: version.trim() || null,
    note: note.trim(),
  });

  return { type, setType, tags, setTags, version, setVersion, note, setNote, confirm };
};

export { useUploadForm };
