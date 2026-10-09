/* @layer hub-core @kind logic */
const readRequired = (key: string): string => {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing environment variable ${key}`);
  return value;
};

export { readRequired };
