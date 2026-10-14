/* @layer renderer-components @kind logic */
const byteCellBackground = (byte: number): string => `rgba(129,140,248,${Math.min(1, byte / 255 * 0.8 + 0.2)})`;

export { byteCellBackground };
