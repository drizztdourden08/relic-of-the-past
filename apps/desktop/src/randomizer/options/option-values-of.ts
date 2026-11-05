/* @layer renderer-app @kind logic */
type PlainValue = string | number | boolean;

const isPlainValue = (value: unknown): value is PlainValue =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';

const optionValuesOf = (options: unknown): Record<string, PlainValue> => {
  if (typeof options !== 'object' || options === null) return {};
  return Object.fromEntries(Object.entries(options).filter((entry): entry is [string, PlainValue] => isPlainValue(entry[1])));
};

export { optionValuesOf };
