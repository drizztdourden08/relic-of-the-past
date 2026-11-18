/* @layer renderer-components @kind constants */
import type { UploadMode } from './UploadField.type';

const UPLOAD_MODE_OPTIONS: { value: UploadMode; label: string }[] = [
  { value: 'file', label: 'File' },
  { value: 'link', label: 'Link' },
];

const DEFAULT_URL_PLACEHOLDER = 'Paste download URL...';

export { DEFAULT_URL_PLACEHOLDER, UPLOAD_MODE_OPTIONS };
