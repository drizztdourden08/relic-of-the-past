/* @layer renderer-components @kind logic */
const rangeNote = (n: number, min?: number, max?: number): string | undefined => {
  if (min !== undefined && n < min) return `Valid, but below this field's ${min}.`;
  if (max !== undefined && n > max) return `Valid, but above this field's ${max}.`;
  return undefined;
};

export { rangeNote };
