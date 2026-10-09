/* @layer hub-core @kind logic */
const encodeRfc5987Value = (value: string): string =>
  encodeURIComponent(value).replace(/['()*!]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

export { encodeRfc5987Value };
