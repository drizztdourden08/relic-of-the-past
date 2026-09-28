/* @layer site-kit @kind logic */
/**
 * One part PUT to its presigned URL. XMLHttpRequest instead of fetch because only it
 * reports upload progress. Resolves with the ETag the bucket answered, which complete
 * needs in part order. While the browser is offline the PUT waits for the connection
 * to come back, so a dropped network does not spend the part's tries. The signal cancels
 * the wait and the request.
 */
type PutPartParams = {
  url: string;
  blob: Blob;
  onProgress: (loaded: number) => void;
  signal?: AbortSignal;
};

const waitOnline = (signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  if (navigator.onLine) {
    resolve();
    return;
  }
  const done = () => {
    window.removeEventListener('online', done);
    signal?.removeEventListener('abort', stop);
    resolve();
  };
  const stop = () => {
    window.removeEventListener('online', done);
    reject(signal?.reason);
  };
  window.addEventListener('online', done);
  signal?.addEventListener('abort', stop, { once: true });
});

const send = (params: PutPartParams): Promise<string> => {
  const { url, blob, onProgress, signal } = params;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const cancel = () => xhr.abort();
    signal?.addEventListener('abort', cancel, { once: true });
    const settle = () => signal?.removeEventListener('abort', cancel);
    xhr.open('PUT', url);
    xhr.upload.onprogress = (event) => onProgress(event.loaded);
    xhr.onerror = () => {
      settle();
      reject(new Error('The upload connection failed.'));
    };
    xhr.onabort = () => {
      settle();
      reject(signal?.reason ?? new Error('The upload was cancelled.'));
    };
    xhr.onload = () => {
      settle();
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

const putPart = async (params: PutPartParams): Promise<string> => {
  const { signal } = params;
  signal?.throwIfAborted();
  await waitOnline(signal);
  return send(params);
};

export { putPart };
export type { PutPartParams };
