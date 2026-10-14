/* @layer renderer-components @kind constants */
import type { ImportStatus } from './ImportForm.type';

const DEFAULT_PLACEHOLDER = 'Paste download URL...';
const DEFAULT_ACCEPT = ['.zip'];
const DEFAULT_DROP_LABEL = 'Drop files here';

const NO_STATUS: ImportStatus = { message: '', variant: '' };

export { DEFAULT_ACCEPT, DEFAULT_DROP_LABEL, DEFAULT_PLACEHOLDER, NO_STATUS };
