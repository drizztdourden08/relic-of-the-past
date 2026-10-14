/* @layer hub-core @kind logic */
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListPartsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HUB_LIMITS } from '@rotp/hub-contracts';
import type { UploadedPart } from '@rotp/hub-contracts';
import type { StorageClient } from './create-storage.type';

const multipartOps = ({ s3, bucket }: StorageClient) => {
  const begin = async (key: string, contentType: string): Promise<string> => {
    const out = await s3().send(new CreateMultipartUploadCommand({ Bucket: bucket(), Key: key, ContentType: contentType }));
    if (!out.UploadId) throw new Error('Multipart upload returned no id');
    return out.UploadId;
  };

  const signPart = (key: string, uploadId: string, part: number): Promise<string> =>
    getSignedUrl(s3(), new UploadPartCommand({ Bucket: bucket(), Key: key, UploadId: uploadId, PartNumber: part }), {
      expiresIn: HUB_LIMITS.partUrlSeconds,
    });

  const complete = async (key: string, uploadId: string, etags: string[]): Promise<void> => {
    const Parts = etags.map((ETag, i) => ({ ETag, PartNumber: i + 1 }));
    await s3().send(new CompleteMultipartUploadCommand({ Bucket: bucket(), Key: key, UploadId: uploadId, MultipartUpload: { Parts } }));
  };

  const abort = async (key: string, uploadId: string): Promise<void> => {
    await s3().send(new AbortMultipartUploadCommand({ Bucket: bucket(), Key: key, UploadId: uploadId }));
  };

  const listParts = async (key: string, uploadId: string): Promise<UploadedPart[]> => {
    const found: UploadedPart[] = [];
    let marker: string | undefined;
    do {
      const out = await s3().send(new ListPartsCommand({ Bucket: bucket(), Key: key, UploadId: uploadId, PartNumberMarker: marker }));
      for (const { PartNumber, ETag, Size } of out.Parts ?? []) {
        if (PartNumber && ETag) found.push({ part: PartNumber, etag: ETag, size: Size ?? 0 });
      }
      marker = out.IsTruncated ? out.NextPartNumberMarker : undefined;
    } while (marker);
    return found;
  };

  return { begin, signPart, complete, abort, listParts };
};

export { multipartOps };
