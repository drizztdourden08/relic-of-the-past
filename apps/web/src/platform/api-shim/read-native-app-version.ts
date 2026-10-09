/* @layer renderer-other @kind logic */
const readNativeAppVersion = async (): Promise<string> => {
  try {
    const { App } = await import('@capacitor/app');
    return (await App.getInfo()).version || '0.0.0';
  } catch {
    return '0.0.0';
  }
};

export { readNativeAppVersion };
