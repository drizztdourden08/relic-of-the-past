/* @layer hub-core @kind logic */
import { encodeRfc5987Value } from './encode-rfc5987-value';
import { safeName } from './safe-name';

const attachmentDisposition = (name: string): string => {
  const safe = safeName(name);
  const ascii = safe.replace(/[^\x20-\x7e]/g, '_');
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeRfc5987Value(safe)}`;
};

export { attachmentDisposition };
