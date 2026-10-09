/* @layer renderer-lib @kind logic */
const ascii = (text: string): Uint8Array => Uint8Array.from(text, (c) => c.charCodeAt(0));

export { ascii };
