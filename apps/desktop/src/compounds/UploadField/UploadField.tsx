/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, DropZone, SegmentedControl, Stack, TextInput } from '@drizztdourden08/tessera/primitives';
import { DEFAULT_URL_PLACEHOLDER, UPLOAD_MODE_OPTIONS } from './UploadField.constants';
import type { UploadFieldProps, UploadMode } from './UploadField.type';
import { RomTable } from './sub-components/RomTable';
import './UploadField.css';

const UploadField = (props: UploadFieldProps) => {
  const { accept, label, hint, status, disabled, variant = 'inline', url = '', urlPlaceholder, urlAction, roms } = props;
  const { onFiles, onUrlChange, onUrlEnter, onModeChange } = props;
  const linkable = onUrlChange !== undefined;
  const [mode, setMode] = useState<UploadMode>(url === '' ? 'file' : 'link');

  const choose = (next: UploadMode) => {
    setMode(next);
    onModeChange?.(next);
  };

  return (
    <Stack gap="sm" className="upload-field">
      {linkable && <SegmentedControl size="sm" value={mode} options={UPLOAD_MODE_OPTIONS} onChange={choose} />}
      {linkable && mode === 'link' ? (
        <Box className="upload-field__link">
          <TextInput
            className="upload-field__url"
            type="text"
            placeholder={urlPlaceholder ?? DEFAULT_URL_PLACEHOLDER}
            value={url}
            disabled={disabled}
            onChange={(e) => onUrlChange(e.currentTarget.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onUrlEnter?.(); }}
          />
          {urlAction}
        </Box>
      ) : (
        <DropZone accept={accept} variant={variant} label={label} hint={hint} status={status} disabled={disabled} onDrop={onFiles} />
      )}
      {roms && <RomTable roms={roms} />}
    </Stack>
  );
};

export { UploadField };
