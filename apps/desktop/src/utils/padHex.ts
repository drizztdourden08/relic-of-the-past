/* @layer renderer-other @kind logic */
const padHex = (v: number): string => v.toString(16).toUpperCase().padStart(4, '0');

export { padHex };
