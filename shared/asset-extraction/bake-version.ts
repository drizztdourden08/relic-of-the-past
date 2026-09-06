/* @layer shared-asset-extraction @kind logic */
/**
 * Bake-format version stamped into the asset blob's reserved header pad.
 *
 * The container header is 16 signature bytes + a 32-byte key hash, then 32 bytes of
 * zero padding before the entry count (see dat-reader.ts / the core's LoadAssets in
 * core/wasm-build/emscripten_io.c, which validates only the first 48 bytes and reads
 * the entry table from byte 80). Bytes 48-79 are therefore free host metadata, and the
 * key-hash signature cannot express this: it tracks entry NAMES only, so a bake that
 * changes what an existing entry CONTAINS (e.g. appending dialogue template lines)
 * produces a byte-identical header. The stamp closes that gap: a cached blob whose
 * version differs from CURRENT_BAKE_VERSION is recompiled at profile load exactly like
 * a missing blob. Blobs baked before stamping existed read as version 0 (zeroed pad).
 */

/**
 * Bump on any bake-output change the key-hash signature cannot see.
 * v1: receipt-message template lines appended after the vanilla dialogue lines
 * (build-language-entry.ts buildLangData).
 * v2: one more template line after those, the archery host's refusal
 * (randomizer-templates.ts, shown by core/game-hooks/archery_host.c).
 * v3: eight more after that, a shelf's refusal per non-rupee currency
 * (randomizer-templates.ts, shown by core/game-hooks/shop_refusal.c).
 * v4: one more after those, a shelf's thanks over a purchase's hold-up
 * (randomizer-templates.ts, shown by core/game-hooks/shop_overrides.c).
 */
const CURRENT_BAKE_VERSION = 4;

const STAMP_OFFSET = 48;
const STAMP_MAGIC = 'RPBK';
const VERSION_OFFSET = STAMP_OFFSET + STAMP_MAGIC.length;
/** Smallest valid container: 88-byte header (sig + hash + pad + count + key length). */
const HEADER_MIN_BYTES = 88;

/** Write the current bake version into a freshly serialized blob's reserved pad. */
const stampBakeVersion = (dat: Buffer): void => {
  dat.write(STAMP_MAGIC, STAMP_OFFSET, 'ascii');
  dat.writeUInt32LE(CURRENT_BAKE_VERSION, VERSION_OFFSET);
};

/** The blob's stamped bake version — 0 for blobs baked before stamping existed. */
const readBakeVersion = (dat: Uint8Array): number => {
  if (dat.length < HEADER_MIN_BYTES) return 0;
  for (let i = 0; i < STAMP_MAGIC.length; i++) {
    if (dat[STAMP_OFFSET + i] !== STAMP_MAGIC.charCodeAt(i)) return 0;
  }
  const view = new DataView(dat.buffer, dat.byteOffset, dat.byteLength);
  return view.getUint32(VERSION_OFFSET, true);
};

/** Whether a cached blob was baked by the current pipeline (stale ⇒ recompile). */
const isCurrentBakeVersion = (dat: Uint8Array): boolean =>
  readBakeVersion(dat) === CURRENT_BAKE_VERSION;

export { CURRENT_BAKE_VERSION, stampBakeVersion, readBakeVersion, isCurrentBakeVersion };
