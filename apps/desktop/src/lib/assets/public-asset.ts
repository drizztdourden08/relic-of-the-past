/* @layer renderer-lib @kind logic */
/**
 * Resolves a bundled public/ asset to a URL that works in both dev and the
 * packaged build. The packaged renderer loads over file://, where a root-absolute
 * path like "/buttons/x.svg" points at the filesystem root and 404s. Vite's
 * BASE_URL ("/" in dev, "./" in the packaged renderer) gives the correct prefix,
 * so callers pass a root-relative path ("buttons/x.svg" or "/buttons/x.svg").
 */
const publicAsset = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\.?\//, '')}`;

export { publicAsset };
