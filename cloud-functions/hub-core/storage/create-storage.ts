/* @layer hub-core @kind logic */
/** The S3 SDK against a Backblaze bucket, behind a few verbs so routes never see bucket
 *  names or part numbers. One storage per bucket, each with its own scoped key; the site
 *  that owns the bucket spells the object keys, and a user-chosen name never becomes one. */
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
import { attachmentDisposition } from './safe-name';

type StorageConfig = { keyId: string; appKey: string; bucket: string; endpoint: string; region: string };

/** Read at the first call, so a build or typecheck never needs the deploy environment. */
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

  /** Every part of an open multipart upload already in the bucket, read page by page. */
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

  /** One PUT for a small object. The signed Content-Length binds the upload to the declared size. */
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

  /** A link the browser shows in place (an image, a video); the stored content type is sent back as given. */
  const signPreview = (key: string, contentType: string): Promise<string> =>
    getSignedUrl(
      s3(),
      new GetObjectCommand({ Bucket: bucket(), Key: key, ResponseContentDisposition: 'inline', ResponseContentType: contentType }),
      { expiresIn: HUB_LIMITS.previewUrlSeconds },
    );

  /** The stored size, or null when the object is not there. */
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

  /** A server-side copy inside the bucket; no bytes pass through the function. */
  const copy = async (from: string, to: string): Promise<void> => {
    await s3().send(new CopyObjectCommand({ Bucket: bucket(), Key: to, CopySource: `${bucket()}/${encodeURIComponent(from)}` }));
  };

  /** Bytes `start` to `end` inclusive, for reading a header without fetching the object. */
  const readRange = async (key: string, start: number, end: number): Promise<Uint8Array> => {
    const out = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key, Range: `bytes=${start}-${end}` }));
    if (!out.Body) throw new Error('Range read returned no body');
    return out.Body.transformToByteArray();
  };

  /** The whole object as a web stream, for hashing it without holding it in memory. */
  const readStream = async (key: string): Promise<ReadableStream> => {
    const out = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
    if (!out.Body) throw new Error('Read returned no body');
    return out.Body.transformToWebStream();
  };

  return { begin, signPart, complete, abort, listParts, signPut, signDownload, signPreview, headSize, remove, copy, readRange, readStream };
};

type Storage = ReturnType<typeof createStorage>;

export { createStorage };
export type { Storage, StorageConfig };
