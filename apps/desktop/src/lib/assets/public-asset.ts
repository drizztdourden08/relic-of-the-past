/* @layer renderer-lib @kind logic */
const publicAsset = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\.?\//, '')}`;

export { publicAsset };
