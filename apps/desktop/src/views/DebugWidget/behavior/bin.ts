/* @layer renderer-widgets @kind logic */
const bin = (value: number, bits: number): string => value.toString(2).padStart(bits, '0');

export { bin };
