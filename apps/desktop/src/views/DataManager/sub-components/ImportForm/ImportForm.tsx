/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button } from '@drizztdourden08/tessera/primitives';
import { UploadField } from '@app/compounds/UploadField';
import { useImportForm } from './behavior/useImportForm';
import { withImportDefaults } from './behavior/with-import-defaults';
import { ImportStatusLine } from './sub-components/ImportStatusLine';
import type { ImportFormProps } from './ImportForm.type';

const ImportForm = (props: ImportFormProps) => {
  const t = useT();
  const { kind, placeholder, accept, dropLabel, dropHint, disabled, children, onUrlImport, onFileImport } = withImportDefaults(props);
  const form = useImportForm({ kind, disabled, onUrlImport, onFileImport });
  const { url, setUrl, status, busy, progress, isDisabled, handleDownload, handleDrop } = form;

  return (
    <Box className="import-form">
      <UploadField
        accept={accept}
        variant="block"
        label={dropLabel}
        hint={dropHint}
        disabled={isDisabled}
        url={url}
        urlPlaceholder={placeholder}
        urlAction={(
          <Button variant="primary" size="sm" onClick={handleDownload} loading={busy} disabled={isDisabled || !url.trim()}>
            {t('data-manager:import-form.download')}
          </Button>
        )}
        onFiles={handleDrop}
        onUrlChange={setUrl}
        onUrlEnter={() => { if (!isDisabled) void handleDownload(); }}
      />
      {children}
      <ImportStatusLine busy={busy} progress={progress} status={status} />
    </Box>
  );
};

export { ImportForm };
