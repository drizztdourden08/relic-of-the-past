/* @layer root-config @kind logic */
import type { FileUpload, UploadedParts } from '@rotp/hub-contracts';
import { filesBucket } from '../../storage/files-bucket';

const listUploadedParts = async (key: string, upload: FileUpload): Promise<UploadedParts> => ({
  parts: await filesBucket.listParts(key, upload.multipartId),
});

export { listUploadedParts };
