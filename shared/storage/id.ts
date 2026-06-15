/* @layer shared-storage @kind logic */
/** Short random id (8 hex/uuid chars), matching the desktop stores' id length. */

const newId = (): string => {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return uuid.slice(0, 8);
  const bytes = globalThis.crypto?.getRandomValues?.(new Uint8Array(4));
  return bytes ? Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('') : Date.now().toString(16).slice(-8);
};

export { newId };
