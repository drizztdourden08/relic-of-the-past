/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { UploadMode } from './UploadField.type';

const UPLOAD_MODE_OPTIONS: { value: UploadMode; label: Message }[] = [
  { value: 'file', label: msg('compounds:upload-field.mode.file') },
  { value: 'link', label: msg('compounds:upload-field.mode.link') },
];

const DEFAULT_URL_PLACEHOLDER = msg('data-manager:import.placeholder');

export { DEFAULT_URL_PLACEHOLDER, UPLOAD_MODE_OPTIONS };
