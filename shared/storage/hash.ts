/* @layer shared-storage @kind logic */
/** SHA-256 via Web Crypto — works in the renderer/Worker on every platform. */

const sha256Hex = async (bytes: Uint8Array): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', bytes as BufferSource);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
};

export { sha256Hex };
