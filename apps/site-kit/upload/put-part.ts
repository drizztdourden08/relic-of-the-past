/* @layer site-kit @kind logic */
import type { PutPartParams } from './put-part.type';

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

const sendWithProgress = (params: PutPartParams): Promise<string> => {
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
  return sendWithProgress(params);
};

export { putPart };
export type { PutPartParams } from './put-part.type';
