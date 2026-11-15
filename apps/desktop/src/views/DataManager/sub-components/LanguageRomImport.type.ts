/* @layer renderer-components @kind types */
import type { ImportFormProps } from './ImportForm/ImportForm.type';

type LanguageRomImportProps = Pick<ImportFormProps, 'onUrlImport' | 'onFileImport'>;

export type { LanguageRomImportProps };
