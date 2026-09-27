/* @layer sanctuary-site @kind hook */
/**
 * The upload list of the Files page: the kit's upload list run with the Sanctuary's
 * uploader. A finished record is handed back so the table can add or replace it.
 */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { useUploads } from '@site-kit/upload/useUploads';
import { SANCTUARY_UPLOADER } from './sanctuary-uploader';

const useMultipartUpload = (onUploaded: (file: SanctuaryFile) => void) => useUploads(SANCTUARY_UPLOADER, onUploaded);

export { useMultipartUpload };
