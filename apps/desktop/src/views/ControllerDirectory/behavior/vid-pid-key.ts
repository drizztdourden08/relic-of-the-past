/* @layer renderer-components @kind logic */
const hex4 = (value: number): string => value.toString(16).padStart(4, '0');

const vidPidKey = (vendorId: number, productId: number): string => `${hex4(vendorId)}:${hex4(productId)}`;

export { vidPidKey };
