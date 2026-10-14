/* @layer renderer-widgets @kind logic */
const hexLabelOf = (value: number, width: number): string => `0x${value.toString(16).toUpperCase().padStart(width, '0')}`;

export { hexLabelOf };
