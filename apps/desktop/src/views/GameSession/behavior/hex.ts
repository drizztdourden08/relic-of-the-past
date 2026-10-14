/* @layer renderer-appshell @kind logic */
const hex = (value: number, width: number): string => `0x${value.toString(16).padStart(width, '0')}`;

export { hex };
