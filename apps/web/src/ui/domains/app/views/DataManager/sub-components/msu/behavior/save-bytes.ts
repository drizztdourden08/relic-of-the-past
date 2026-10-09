/* @layer renderer-components @kind logic */
import { REVOKE_AFTER_MS } from './save-bytes.constants';

const saveBytesAsFile = (fileName: string, bytes: Uint8Array): void => {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const url = URL.createObjectURL(new Blob([copy.buffer], { type: 'application/octet-stream' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_AFTER_MS);
};

export { saveBytesAsFile };
