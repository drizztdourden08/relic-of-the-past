/* @layer hub-core @kind logic */
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HUB_LIMITS } from '@rotp/hub-contracts';
import type { StorageClient } from './create-storage.type';
import { attachmentDisposition } from './safe-name';

const signingOps = ({ s3, bucket }: StorageClient) => {
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

  return { signPut, signDownload, signPreview };
};

export { signingOps };
