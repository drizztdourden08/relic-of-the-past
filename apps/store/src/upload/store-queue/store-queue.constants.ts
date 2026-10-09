/* @layer store-site @kind constants */
import { createUploadQueue } from '@rotp/hub-client';
import { STORE_UPLOADER } from '../store-uploader/store-uploader.constants';

const STORE_QUEUE = createUploadQueue(STORE_UPLOADER);

export { STORE_QUEUE };
