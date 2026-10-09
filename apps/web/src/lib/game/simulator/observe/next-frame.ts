/* @layer bridge-wasm @kind logic */
const nextFrame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));

export { nextFrame };
