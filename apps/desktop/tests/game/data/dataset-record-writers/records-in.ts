/* @layer tests @kind helper */
const recordsIn = (source: string): Record<string, unknown>[] => {
  const body = source.slice(source.indexOf('= [') + 2, source.lastIndexOf('];') + 1);
  return new Function(`return ${body};`)() as Record<string, unknown>[];
};

export { recordsIn };
