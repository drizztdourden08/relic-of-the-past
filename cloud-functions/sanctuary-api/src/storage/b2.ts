/* @layer root-config @kind logic */
/** The S3 SDK against the Backblaze endpoint, behind a few verbs so routes never
 *  see bucket names or part numbers. Object keys are files/<id> (v1 of a file
 *  stored before versions existed), files/<id>/v<n> and reports/<id>.zip; a
 *  user-chosen name never becomes a key. */
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
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { LIMITS } from '../../../../shared/sanctuary';
import { readEnv } from '../env';
import { attachmentDisposition } from './safe-name';

let client: S3Client | null = null;

const s3 = (): S3Client => {
  if (!client) {
    const env = readEnv();
    client = new S3Client({
      region: env.B2_REGION,
      endpoint: env.B2_ENDPOINT,
      credentials: { accessKeyId: env.B2_KEY_ID, secretAccessKey: env.B2_APP_KEY },
    });
  }
  return client;
};

const bucket = (): string => readEnv().B2_BUCKET;

const fileKey = (fileId: string): string => `files/${fileId}`;
const versionKey = (fileId: string, n: number): string => `files/${fileId}/v${n}`;
const reportKey = (reportId: string): string => `reports/${reportId}.zip`;

const begin = async (key: string, contentType: string): Promise<string> => {
  const out = await s3().send(new CreateMultipartUploadCommand({ Bucket: bucket(), Key: key, ContentType: contentType }));
  if (!out.UploadId) throw new Error('Multipart upload returned no id');
  return out.UploadId;
};

const signPart = (key: string, uploadId: string, part: number): Promise<string> =>
  getSignedUrl(s3(), new UploadPartCommand({ Bucket: bucket(), Key: key, UploadId: uploadId, PartNumber: part }), {
    expiresIn: LIMITS.partUrlSeconds,
  });

const complete = async (key: string, uploadId: string, etags: string[]): Promise<void> => {
  await s3().send(
    new CompleteMultipartUploadCommand({
      Bucket: bucket(),
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: etags.map((ETag, i) => ({ ETag, PartNumber: i + 1 })) },
    }),
  );
};

const abort = async (key: string, uploadId: string): Promise<void> => {
  await s3().send(new AbortMultipartUploadCommand({ Bucket: bucket(), Key: key, UploadId: uploadId }));
};

/** One PUT for a small object. The signed Content-Length binds the upload to the declared size. */
const signPut = (key: string, bytes: number, contentType: string): Promise<string> =>
  getSignedUrl(s3(), new PutObjectCommand({ Bucket: bucket(), Key: key, ContentLength: bytes, ContentType: contentType }), {
    expiresIn: LIMITS.partUrlSeconds,
  });

const signDownload = (key: string, name: string): Promise<string> =>
  getSignedUrl(
    s3(),
    new GetObjectCommand({ Bucket: bucket(), Key: key, ResponseContentDisposition: attachmentDisposition(name) }),
    { expiresIn: LIMITS.downloadUrlSeconds },
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

const b2 = { begin, signPart, complete, abort, signPut, signDownload, headSize, remove };

export { b2, fileKey, versionKey, reportKey };
