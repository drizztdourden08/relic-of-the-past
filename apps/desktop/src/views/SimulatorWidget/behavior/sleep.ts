/* @layer renderer-widgets @kind logic */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export { sleep };
