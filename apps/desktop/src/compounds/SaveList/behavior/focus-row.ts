/* @layer renderer-components @kind logic */
import { ROW_ATTRIBUTE } from '../SaveList.constants';

const focusRow = (list: HTMLElement | null, id: string): void => {
  const row = list?.querySelector(`[${ROW_ATTRIBUTE}="${CSS.escape(id)}"]`);
  row?.querySelector<HTMLElement>('button')?.focus();
};

export { focusRow };
