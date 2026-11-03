/* @layer root-config @kind logic */
import { LIMITS, completeFileSchema } from '@rotp/hub-contracts';
import { badRequest, parseBody, verifyUpload } from '@rotp/hub-server';
import { filesBucket } from '../../storage/files-bucket';
import type { UploadTarget } from './upload-routes.type';

const completeUpload = async (body: unknown, { key, bytes, upload }: UploadTarget, discard: () => Promise<void>): Promise<void> => {
  const { etags } = parseBody(completeFileSchema, body);
  if (etags.length !== upload.parts) throw badRequest(`Expected ${upload.parts} ETags.`);
  await filesBucket.complete(key, upload.multipartId, etags);
  try {
    await verifyUpload(filesBucket, key, bytes, LIMITS.fileBytes);
  } catch (err) {
    await discard();
    throw err;
  }
};

export { completeUpload };
