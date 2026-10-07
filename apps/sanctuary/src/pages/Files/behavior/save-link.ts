/* @layer sanctuary-site @kind logic */
/**
 * Hands a link to the browser as a download, through a detached anchor click. A blob
 * link carries the name to save under; a bucket link names itself in its headers.
 */

/** How long a blob link stays valid after the click, so the save can start reading it. */
const REVOKE_AFTER_MS = 60_000;

const clickLink = (href: string, name?: string) => {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.rel = 'noopener';
  if (name) anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
};

const saveBlob = (blob: Blob, name: string) => {
  const href = URL.createObjectURL(blob);
  clickLink(href, name);
  setTimeout(() => URL.revokeObjectURL(href), REVOKE_AFTER_MS);
};

const saveUrl = (url: string) => clickLink(url);

export { saveBlob, saveUrl };
