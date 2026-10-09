/* @layer renderer-components @kind logic */
import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { advanceOfAttrs, DIALOGUE_LINE_TYPE, endsBoxOfAttrs, toggleWaitAt } from './editor-contract';
import { iconForCodeName } from './icon-for-token';
import { svgForIcon } from './icon-svg';
import type { LineAdvance } from '@shared/game/language';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { EditorState } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import type { AdvanceMarker, LineNode } from './line-end-markers.type';

const kIconPx = 12;
const kWaitOn = 'Ends the box here. The player presses a button to go on. Click to remove.';
const kWaitOff = 'Click to end the box here, so the player presses a button before the next line.';
const kScroll = 'The box scrolls up a line to make room for the next one.';

const advanceMarkerFor = (advance: LineAdvance): AdvanceMarker | null => {
  if (advance === null) return null;
  if (advance.kind === 'scroll') {
    return { className: 'line-end line-end--scroll', title: kScroll, icon: 'Scroll', key: 'scroll' };
  }
  return {
    className: 'line-end line-end--row',
    title: `The pen returns to the left of row ${advance.row} for the next line.`,
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

const waitDom = (view: EditorView, pos: number, on: boolean): HTMLElement => {
  const element = markerDom(
    `line-end line-end--wait${on ? ' line-end--on' : ' line-end--off'}`,
    on ? kWaitOn : kWaitOff,
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

const decorationsFor = (state: EditorState): DecorationSet => {
  const lines = linesOf(state.doc);
  const decorations: Decoration[] = [];

  lines.forEach((line, index) => {
    const end = line.pos + line.node.nodeSize - 1;

    const next = lines[index + 1];
    const marker = next === undefined ? null : advanceMarkerFor(advanceOfAttrs(next.node.attrs));
    decorations.push(Decoration.widget(
      end,
      marker === null ? emptyDom : () => markerDom(marker.className, marker.title, marker.icon),
      { side: 1, key: `adv-${marker?.key ?? 'none'}-${line.pos}` },
    ));

    const on = endsBoxOfAttrs(line.node.attrs);
    const offered = on || isActive(state, line);
    decorations.push(Decoration.widget(
      end,
      offered ? (view) => waitDom(view, line.pos, on) : emptyDom,
      { side: 1, key: `wait-${line.pos}-${on ? 'on' : offered ? 'off' : 'none'}` },
    ));
  });

  return DecorationSet.create(state.doc, decorations);
};

const LineEndMarkers = Extension.create({
  name: 'lineEndMarkers',

  addProseMirrorPlugins: () => [
    new Plugin({ props: { decorations: decorationsFor } }),
  ],
});

export { LineEndMarkers };
