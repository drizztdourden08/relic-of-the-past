/* @layer renderer-app @kind logic */
const waitFrames = async (count: number): Promise<void> => {
  for (let i = 0; i < count; i += 1) await new Promise<void>((resolve) => { requestAnimationFrame(() => resolve()); });
};

export { waitFrames };
