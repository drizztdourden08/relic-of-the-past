/* @layer shared-asset-extraction @kind logic */
const toPlainText = (bytes: Buffer): string => {
  let result = '';
  for (let index = 0; index < bytes.length; index++) {
    const value = bytes[index] ?? 0;
    if (value === 0x1a) {
      index += 4;
      result += ' ';
    } else if (value === 0x0a) {
      result += '\n';
    } else if (value >= 0x20 && value < 0x7f) {
      result += String.fromCharCode(value);
    }
  }
  return result.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
};

export { toPlainText };
