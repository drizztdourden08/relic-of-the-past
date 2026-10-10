/* @layer tests @kind helper */
const required = <T>(value: T | null | undefined, what: string): T => {
  if (value === undefined || value === null) throw new Error(`test expected ${what} to exist`);
  return value;
};

export { required };
