/* @layer renderer-components @kind logic */
import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { advanceOfAttrs, DIALOGUE_LINE_TYPE, endsBoxOfAttrs, toggleWaitAt } from './editor-contract';
import { iconForCodeName } from './icon-for-token';
import { svgForIcon } from './icon-svg';
import type { LineAdvance } from '@rotp/languages';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { EditorState } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import type { AdvanceMarker, LineNode } from './line-end-markers.type';

const kIconPx = 12;

const advanceMarkerFor = (t: I18n['t'], advance: LineAdvance): AdvanceMarker | null => {
  if (advance === null) return null;
  if (advance.kind === 'scroll') {
    return { className: 'line-end line-end--scroll', title: t('language-editor:line-end.scroll'), icon: 'Scroll', key: 'scroll' };
  }
  return {
    className: 'line-end line-end--row',
    title: t('language-editor:line-end.row', { row: advance.row }),
    icon: String(advance.row),
    key: `row${advance.row}`,
  };
};

const linesOf = (doc: ProseMirrorNode): LineNode[] => {
  const lines: LineNode[] = [];
  doc.forEach((node, offset) => {
    if (node.type.name === DIALOGUE_LINE_TYPE) lines.push({ node, pos: offset });
  });
  return lines;
};

const markerDom = (className: string, title: string, iconName: string): HTMLElement => {
  const element = document.createElement('span');
  element.className = className;
  element.title = title;
  element.contentEditable = 'false';
  element.appendChild(svgForIcon(iconForCodeName(iconName), kIconPx));
  return element;
};

const emptyDom = (): HTMLElement => {
  const element = document.createElement('span');
  element.className = 'line-end line-end--empty';
  element.contentEditable = 'false';
  return element;
};

const waitDom = (t: I18n['t'], view: EditorView, pos: number, on: boolean): HTMLElement => {
  const element = markerDom(
    `line-end line-end--wait${on ? ' line-end--on' : ' line-end--off'}`,
    on ? t('language-editor:line-end.wait-on') : t('language-editor:line-end.wait-off'),
    'Waitkey',
  );
  element.setAttribute('role', 'button');
  element.addEventListener('mousedown', (event) => event.preventDefault());
  element.addEventListener('click', () => toggleWaitAt(pos)(view.state, view.dispatch));
  return element;
};

const isActive = (state: EditorState, line: LineNode): boolean => (
  state.selection.from >= line.pos && state.selection.to <= line.pos + line.node.nodeSize
);

const waitKeyState = (on: boolean, offered: boolean): string => {
  if (on) return 'on';
  return offered ? 'off' : 'none';
};

const decorationsFor = (t: I18n['t'], state: EditorState): DecorationSet => {
  const lines = linesOf(state.doc);
  const decorations: Decoration[] = [];

  lines.forEach((line, index) => {
    const end = line.pos + line.node.nodeSize - 1;

    const next = lines[index + 1];
    const marker = next === undefined ? null : advanceMarkerFor(t, advanceOfAttrs(next.node.attrs));
    decorations.push(Decoration.widget(
      end,
      marker === null ? emptyDom : () => markerDom(marker.className, marker.title, marker.icon),
      { side: 1, key: `adv-${marker?.key ?? 'none'}-${line.pos}` },
    ));

    const on = endsBoxOfAttrs(line.node.attrs);
    const offered = on || isActive(state, line);
    decorations.push(Decoration.widget(
      end,
      offered ? (view) => waitDom(t, view, line.pos, on) : emptyDom,
      { side: 1, key: `wait-${line.pos}-${waitKeyState(on, offered)}` },
    ));
  });

  return DecorationSet.create(state.doc, decorations);
};

const lineEndMarkersFor = (t: I18n['t']) => Extension.create({
  name: 'lineEndMarkers',

  addProseMirrorPlugins: () => [
    new Plugin({ props: { decorations: (state: EditorState) => decorationsFor(t, state) } }),
  ],
});

export { lineEndMarkersFor };
