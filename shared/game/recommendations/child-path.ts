/* @layer shared-game @kind logic */
const childPath = (parent: string, segment: string, isIndex: boolean): string => {
  if (isIndex) return `${parent}[${segment}]`;
  return parent ? `${parent}.${segment}` : segment;
};

export { childPath };
