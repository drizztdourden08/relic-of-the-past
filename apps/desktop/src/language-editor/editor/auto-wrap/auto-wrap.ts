/* @layer renderer-components @kind logic */
import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { autoWrapKey } from './auto-wrap-key';
import { cutFirstOverlongLine } from './cut-first-overlong-line';
import { MAX_CUTS_PER_PASS } from './auto-wrap.constants';

const autoWrapPlugin = () => new Plugin({
  key: autoWrapKey,
  appendTransaction: (transactions, _oldState, newState) => {
    if (!transactions.some((t) => t.docChanged)) return null;
    if (transactions.some((t) => t.getMeta(autoWrapKey) === true)) return null;

    const tr = newState.tr;
    let cuts = 0;
    while (cuts < MAX_CUTS_PER_PASS && cutFirstOverlongLine(tr)) cuts += 1;

    if (cuts === 0) return null;
    tr.setMeta(autoWrapKey, true);
    return tr;
  },
});

const AutoWrap = Extension.create({
  name: 'dialogueAutoWrap',
  addProseMirrorPlugins: () => [autoWrapPlugin()],
});

export { AutoWrap };
