/* @layer root-config @kind logic */
import { fileSignPartsSchema } from '@rotp/hub-contracts';
import type { FileUpload } from '@rotp/hub-contracts';
import { badRequest, parseBody } from '@rotp/hub-server';
import { filesBucket } from '../../storage/files-bucket';
import type { PartsDoneRecorder } from './upload-routes.type';

const signRequestedParts = async (body: unknown, key: string, upload: FileUpload, record: PartsDoneRecorder) => {
  const { parts, partsDone } = parseBody(fileSignPartsSchema, body);
  if (parts.some((part) => part > upload.parts)) throw badRequest(`This upload has ${upload.parts} parts.`);
  if (partsDone !== undefined) await record(partsDone);
  const urls = await Promise.all(
    parts.map(async (part) => ({ part, url: await filesBucket.signPart(key, upload.multipartId, part) })),
  );
  return { urls };
};

export { signRequestedParts };
