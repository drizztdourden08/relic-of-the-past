/* @layer electron-main @kind logic */
/** Conversions between Node Buffers and the ArrayBuffers crossing the IPC boundary. */

/** View a Buffer's exact bytes as a standalone ArrayBuffer (for IPC return values). */
const toArrayBuffer = (buf: Buffer): ArrayBuffer =>
  buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;

/** Same as toArrayBuffer but passes through null (the common "missing file" return). */
const toArrayBufferOrNull = (buf: Buffer | null): ArrayBuffer | null =>
  buf ? toArrayBuffer(buf) : null;

/** Wrap an optional incoming ArrayBuffer as a Buffer, preserving undefined. */
const toOptionalBuffer = (data?: ArrayBuffer): Buffer | undefined =>
  data ? Buffer.from(data) : undefined;

/** Base64-encode a Buffer, passing through null (the common "missing file" return). */
const toBase64OrNull = (buf: Buffer | null): string | null =>
  buf ? buf.toString('base64') : null;

export { toArrayBuffer, toArrayBufferOrNull, toOptionalBuffer, toBase64OrNull };
