/* @layer renderer-other @kind logic */
const toHex4 = (value: number): string => value.toString(16).padStart(4, '0');

const toVidPid = (vendorId: number, productId: number): string => `${toHex4(vendorId)}:${toHex4(productId)}`;

export { toVidPid };
