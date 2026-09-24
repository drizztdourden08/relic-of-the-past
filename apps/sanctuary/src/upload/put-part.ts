/* @layer sanctuary-site @kind logic */
/**
 * One part PUT to its presigned URL. XMLHttpRequest instead of fetch because only it
 * reports upload progress. Resolves with the ETag the bucket answered, which complete
 * needs in part order.
 */
type PutPartParams = {
  url: string;
  blob: Blob;
  onProgress: (loaded: number) => void;
};

const putPart = (params: PutPartParams): Promise<string> => {
  const { url, blob, onProgress } = params;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.upload.onprogress = (event) => onProgress(event.loaded);
    xhr.onerror = () => reject(new Error('The upload connection failed.'));
    xhr.onabort = () => reject(new Error('The upload was cancelled.'));
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`The bucket refused a part (${xhr.status}).`));
        return;
      }
      const etag = xhr.getResponseHeader('ETag');
      if (!etag) {
        reject(new Error('The bucket sent no ETag; check the bucket CORS rule exposes it.'));
        return;
      }
      onProgress(blob.size);
      resolve(etag);
    };
    xhr.send(blob);
  });
};

export { putPart };
export type { PutPartParams };
