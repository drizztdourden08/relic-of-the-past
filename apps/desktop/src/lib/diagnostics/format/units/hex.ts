/* @layer renderer-lib @kind logic */
const hex = (value: number): string => `0x${value.toString(16).toUpperCase().padStart(4, '0')}`;

export { hex };
