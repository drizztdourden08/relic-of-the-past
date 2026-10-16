/* @layer renderer-components @kind component */
import { DropZone, TextInput, Box, Button } from '@drizztdourden08/tessera/primitives';
import { useImportForm } from './behavior/useImportForm';
import { withImportDefaults } from './behavior/with-import-defaults';
import { ImportStatusLine } from './sub-components/ImportStatusLine';
import type { ImportFormProps } from './ImportForm.type';

const ImportForm = (props: ImportFormProps) => {
  const { kind, placeholder, accept, dropLabel, dropHint, disabled, children, onUrlImport, onFileImport } = withImportDefaults(props);
  const form = useImportForm({ kind, disabled, onUrlImport, onFileImport });
  const { url, setUrl, status, busy, progress, isDisabled, handleDownload, handleDrop, handleKeyDown } = form;

  return (
    <Box className="import-form">
      <Box className="import-form__url-row">
        <TextInput
          className="import-form__url-input"
          type="text"
          placeholder={placeholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleDownload}
          loading={busy}
          disabled={isDisabled || !url.trim()}
        >
          Download
        </Button>
      </Box>
      <Box className="import-form__divider">or</Box>
      <DropZone
        accept={accept}
        label={dropLabel}
        hint={dropHint}
        disabled={isDisabled}
        onDrop={handleDrop}
      />
      {children}
      <ImportStatusLine busy={busy} progress={progress} status={status} />
    </Box>
  );
};

export { ImportForm };
