/* @layer bridge-wasm @kind logic */
/**
 * A ConnectionRefused in words: one short sentence per error code the protocol names. The
 * network tab shows the sentence; the log keeps the codes.
 */

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

/** Every distinct sentence for the codes, in order; the server may send none. */
const refusalText = (codes: readonly string[], slotName: string): string => {
  const sentences = [...new Set(codes.map((code) => refusalSentence(code, slotName)))];
  return sentences.length > 0 ? sentences.join(' ') : 'The server refused the connection.';
};

export { refusalSentence, refusalText };
