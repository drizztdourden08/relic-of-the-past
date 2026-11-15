/* @layer renderer-components @kind component */
import { ImportForm } from './ImportForm';
import { LANGUAGE_ROM_ACCEPT } from './language-manager/language-manager.constants';
import type { LanguageRomImportProps } from './LanguageRomImport.type';

const LanguageRomImport = (props: LanguageRomImportProps) => {
  const { onUrlImport, onFileImport } = props;
  return (
    <ImportForm
      kind="language"
      placeholder="Paste ROM download URL..."
      accept={[...LANGUAGE_ROM_ACCEPT]}
      dropLabel="Drop a ROM file to extract its language"
      dropHint="The language is read from the ROM. The ROM is not saved."
      onUrlImport={onUrlImport}
      onFileImport={onFileImport}
    />
  );
};

export { LanguageRomImport };
