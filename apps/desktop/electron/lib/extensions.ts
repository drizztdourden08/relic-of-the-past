/* @layer electron-main @kind logic */
/** Shared file-extension sets used by the import/extract pipelines. */

const ROM_EXTENSIONS = new Set(['.sfc', '.smc']);
const MSU_EXTENSIONS = new Set(['.pcm', '.opuz', '.msu']);
const ARCHIVE_EXTENSIONS = new Set(['.zip', '.7z', '.rar']);

export { ARCHIVE_EXTENSIONS, MSU_EXTENSIONS, ROM_EXTENSIONS };
