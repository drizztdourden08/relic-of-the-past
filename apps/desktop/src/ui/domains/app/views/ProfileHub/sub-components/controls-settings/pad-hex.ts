/* @layer renderer-components @kind logic */
const padHex = (v: string): string => {
  return v.toLowerCase().padStart(4, '0');
};

export { padHex };
