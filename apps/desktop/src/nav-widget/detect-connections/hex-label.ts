/* @layer renderer-widgets @kind logic */
const hexLabel = (prefix: string, value: number): string => `${prefix} 0x${value.toString(16).toUpperCase()}`;

export { hexLabel };
