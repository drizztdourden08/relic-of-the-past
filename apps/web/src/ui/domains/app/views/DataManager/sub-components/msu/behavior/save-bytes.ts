/* @layer renderer-components @kind logic */
/**
 * Hands an exported pack to the user as a file.
 *
 * There is no save-file channel in the app's IPC surface — every other write goes into the
 * app's own data folder — so this uses the one path that already exists on both hosts: a blob
 * download. The desktop shell has no `will-download` handler, so Chromium's default applies
 * and the user gets a real save dialog; in a plain browser it lands in Downloads.
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
