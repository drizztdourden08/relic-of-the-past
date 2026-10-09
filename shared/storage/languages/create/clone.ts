/* @layer shared-storage @kind logic */
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export { clone };
