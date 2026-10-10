/* @layer hub-core @kind logic */
const trimmedEnv = (key: string): string | null => {
  const value = process.env[key]?.trim();
  return value === undefined || value === '' ? null : value;
};

export { trimmedEnv };
