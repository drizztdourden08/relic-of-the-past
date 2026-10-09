/* @layer hub-core @kind logic */
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  ListPartsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HUB_LIMITS } from '../../../shared/hub';
import type { UploadedPart } from '../../../shared/hub';
import type { StorageConfig } from './create-storage.type';
import { attachmentDisposition } from './safe-name';

const createStorage = (readConfig: () => StorageConfig) => {
  let client: S3Client | null = null;

  const s3 = (): S3Client => {
    if (!client) {
      const { region, endpoint, keyId, appKey } = readConfig();
      client = new S3Client({ region, endpoint, credentials: { accessKeyId: keyId, secretAccessKey: appKey } });
    }
    return client;
  };

  const bucket = (): string => readConfig().bucket;

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

  const signPut = (key: string, bytes: number, contentType: string): Promise<string> =>
    getSignedUrl(s3(), new PutObjectCommand({ Bucket: bucket(), Key: key, ContentLength: bytes, ContentType: contentType }), {
      expiresIn: HUB_LIMITS.partUrlSeconds,
    });

  const signDownload = (key: string, name: string): Promise<string> =>
    getSignedUrl(
      s3(),
      new GetObjectCommand({ Bucket: bucket(), Key: key, ResponseContentDisposition: attachmentDisposition(name) }),
      { expiresIn: HUB_LIMITS.downloadUrlSeconds },
    );

  const signPreview = (key: string, contentType: string): Promise<string> =>
    getSignedUrl(
      s3(),
      new GetObjectCommand({ Bucket: bucket(), Key: key, ResponseContentDisposition: 'inline', ResponseContentType: contentType }),
      { expiresIn: HUB_LIMITS.previewUrlSeconds },
    );

  const headSize = async (key: string): Promise<number | null> => {
    try {
      const out = await s3().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
      return out.ContentLength ?? null;
    } catch {
      return null;
    }
  };

  const remove = async (key: string): Promise<void> => {
    await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
  };

  const copy = async (from: string, to: string): Promise<void> => {
    await s3().send(new CopyObjectCommand({ Bucket: bucket(), Key: to, CopySource: `${bucket()}/${encodeURIComponent(from)}` }));
  };

  const readRange = async (key: string, start: number, end: number): Promise<Uint8Array> => {
    const out = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key, Range: `bytes=${start}-${end}` }));
    if (!out.Body) throw new Error('Range read returned no body');
    return out.Body.transformToByteArray();
  };

  const readStream = async (key: string): Promise<ReadableStream> => {
    const out = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
    if (!out.Body) throw new Error('Read returned no body');
    return out.Body.transformToWebStream();
  };

  return { begin, signPart, complete, abort, listParts, signPut, signDownload, signPreview, headSize, remove, copy, readRange, readStream };
};

export { createStorage };
export type { Storage, StorageConfig } from './create-storage.type';
