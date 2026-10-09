/* @layer renderer-other @kind logic */
const refuseEdit = async (): Promise<{ success: false; error: string }> =>
  ({ success: false, error: 'The dataset editor needs the desktop app.' });

export { refuseEdit };
