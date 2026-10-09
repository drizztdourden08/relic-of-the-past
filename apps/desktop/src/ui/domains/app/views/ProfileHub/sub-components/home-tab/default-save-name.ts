/* @layer renderer-components @kind logic */
const defaultSaveName = (): string => {
  return `Save - ${new Date().toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })}`;
};

export { defaultSaveName };
