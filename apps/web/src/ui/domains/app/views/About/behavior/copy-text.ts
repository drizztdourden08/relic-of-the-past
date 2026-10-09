/* @layer renderer-components @kind logic */
const execCopy = (): void => {
  try {
    document.execCommand('copy');
  } catch {
    return;
  }
};

const copyWithTextarea = (text: string): void => {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  execCopy();
  document.body.removeChild(ta);
};

const copyText = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    copyWithTextarea(text);
  }
};

export { copyText };
