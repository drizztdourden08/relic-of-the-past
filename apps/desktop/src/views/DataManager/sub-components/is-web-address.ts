/* @layer renderer-components @kind logic */
const WEB_PROTOCOLS: readonly string[] = ['http:', 'https:'];

const isWebAddress = (text: string): boolean => {
  try {
    return WEB_PROTOCOLS.includes(new URL(text).protocol);
  } catch {
    return false;
  }
};

export { isWebAddress };
