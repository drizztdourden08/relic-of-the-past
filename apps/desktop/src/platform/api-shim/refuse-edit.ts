/* @layer renderer-other @kind logic */
const refuseEdit = (): Promise<{ success: false; error: string }> =>
  Promise.resolve({ success: false, error: 'The dataset editor needs the desktop app.' });

export { refuseEdit };
