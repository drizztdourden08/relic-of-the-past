/* @layer electron-main @kind logic */
const toVidPid = (vendorId: number, productId: number): string =>
  `${vendorId.toString(16).padStart(4, '0')}:${productId.toString(16).padStart(4, '0')}`;

export { toVidPid };
