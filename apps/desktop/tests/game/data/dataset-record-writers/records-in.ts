/* @layer tests @kind helper */
type RecordListSource = () => Record<string, unknown>[];

const recordsIn = (source: string): Record<string, unknown>[] => {
  const body = source.slice(source.indexOf('= [') + 2, source.lastIndexOf('];') + 1);
  const evaluate = new Function(`return ${body};`) as RecordListSource;
  return evaluate();
};

export { recordsIn };
