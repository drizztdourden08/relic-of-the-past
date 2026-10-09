/* @layer bridge-wasm @kind logic */
const waitingDeliveries = new Map<string, () => void>();

export { waitingDeliveries };
