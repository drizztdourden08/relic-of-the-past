/* @layer hub-core @kind logic */
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import type { StorageClient } from './create-storage.type';

const objectOps = ({ s3, bucket }: StorageClient) => {
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

  return { headSize, remove, copy, readRange, readStream };
};

export { objectOps };
