/* @layer renderer-widgets @kind logic */
const hex = (value: number, pad = 2): string => `0x${value.toString(16).padStart(pad, '0')}`;

export { hex };
