/* @layer renderer-components @kind component */
import { PatchedImportForm } from '@app/compounds/PatchedImportForm';
import { PatchedImportReport } from '@app/compounds/PatchedImportReport';
import { useLanguagePatchedImport } from './language-manager/useLanguagePatchedImport';
import type { LanguageCreationParams } from './language-manager/language-manager.type';

const LanguagePatchedImport = (props: LanguageCreationParams) => {
  const { busy, error, parts, handlePatchedImport } = useLanguagePatchedImport(props);
  return (
    <>
      <PatchedImportForm busy={busy} error={error} onImport={handlePatchedImport} />
      <PatchedImportReport parts={parts} />
    </>
  );
};

export { LanguagePatchedImport };
