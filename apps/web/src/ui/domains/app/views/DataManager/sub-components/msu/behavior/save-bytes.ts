/* @layer renderer-components @kind logic */
/**
 * A blob download, the one save path both hosts share (there is no save-file IPC channel). The
 * desktop shell has no `will-download` handler, so Chromium shows a real save dialog.
 */

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
  // Revoking straight away can race the download starting, so let the task queue drain first.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export { saveBytesAsFile };
