/* @layer renderer-app @kind logic */
const findingCount = (count: number): string => `${count} finding${count === 1 ? '' : 's'}`;

export { findingCount };
