/* @layer bridge-wasm @kind logic */
const refusalSentence = (code: string, slotName: string): string => {
  switch (code) {
    case 'InvalidSlot':
      return `No player named ${slotName} in this room.`;
    case 'InvalidGame':
      return `This room has no Relic of the Past player named ${slotName}.`;
    case 'IncompatibleVersion':
      return 'The server needs a newer client.';
    case 'InvalidPassword':
      return 'Wrong room password.';
    case 'InvalidItemsHandling':
      return 'The server refused this client\'s settings.';
    default:
      return `The server refused the connection (${code}).`;
  }
};

const refusalText = (codes: readonly string[], slotName: string): string => {
  const sentences = [...new Set(codes.map((code) => refusalSentence(code, slotName)))];
  return sentences.length > 0 ? sentences.join(' ') : 'The server refused the connection.';
};

export { refusalText };
