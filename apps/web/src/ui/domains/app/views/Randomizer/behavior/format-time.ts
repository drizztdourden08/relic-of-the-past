/* @layer renderer-components @kind logic */
const formatTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString(undefined, { hour12: false });

export { formatTime };
