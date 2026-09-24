/* @layer root-config @kind logic */
/** The original file name only ever appears in a download's Content-Disposition.
 *  Quotes, control characters and path separators are dropped so the header
 *  cannot be broken or point anywhere. */
const MAX_CHARS = 150;

const safeName = (name: string): string => {
  const cleaned = name
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, '')
    .replace(/[\s.]+$/g, '')
    .trim()
    .slice(0, MAX_CHARS);
  return cleaned || 'download';
};

/**
 * RFC 5987 value for filename*: encodeURIComponent leaves ( ) ' * ! raw, which the header
 * grammar does not allow and B2 rejects, so those five are encoded too.
 */
const encodeExtValue = (value: string): string =>
  encodeURIComponent(value).replace(/['()*!]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

const attachmentDisposition = (name: string): string => {
  const safe = safeName(name);
  const ascii = safe.replace(/[^\x20-\x7e]/g, '_');
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeExtValue(safe)}`;
};

export { safeName, attachmentDisposition };
