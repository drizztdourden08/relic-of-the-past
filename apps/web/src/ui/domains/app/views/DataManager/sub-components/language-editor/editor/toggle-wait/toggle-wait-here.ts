/* @layer renderer-components @kind logic */
import { lineHere } from '../line-here';
import { toggleWaitAt } from './toggle-wait-at';
import type { Command } from '@tiptap/pm/state';

const toggleWaitHere: Command = (state, dispatch) => {
  const here = lineHere(state);
  return here === null ? false : toggleWaitAt(here.pos)(state, dispatch);
};

export { toggleWaitHere };
