/* @layer renderer-components @kind logic */
/**
 * The markers drawn at the END of a line: the return or scroll that moves the
 * pen on, and the wait that closes a box.
 *
 * A wait, a row return and a scroll are the codes a player actually experiences,
 * and all of them happen at a line's edge, never inside a sentence. So the
 * advance is an icon at the end of the line the box moves on FROM. That is where
 * a reader experiences it, even though the code belongs to the line below. The
 * wait is an icon on the line it closes.
 *
 * They are WIDGET DECORATIONS: no text, no size in the document, nothing the
 * caret can land in or a copy can carry out. Placement follows the line
 * structure, so none is ever typed.
 *
 * Every line gets BOTH slots, in a fixed order, and a slot with nothing to show
 * is hidden, not omitted: a marker that appears only sometimes used to
 * shunt its neighbour sideways every time the caret moved. The wait slot is the
 * one control here. It is visible when on, offered faintly on the caret's line,
 * and toggled by click. The advance markers state facts and take no pointer at
 * all.
 *
 * Mousedown on the wait is swallowed so the click never moves the caret; the
 * keyboard route to the same toggle is on the line node itself.
 */
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

const kIconPx = 12;
const kWaitOn = 'Ends the box here. The player presses a button to go on. Click to remove.';
const kWaitOff = 'Click to end the box here, so the player presses a button before the next line.';
const kScroll = 'The box scrolls up a line to make room for the next one.';

/** One advance marker: how it is drawn, what it says, and which symbol it takes. */
type AdvanceMarker = { className: string; title: string; icon: string; key: string };

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

/** One paragraph, with the absolute position it starts at. */
type LineNode = { node: ProseMirrorNode; pos: number };

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

/** The fixed slot with nothing in it: present, invisible, holding the width. */
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

/** The caret sits in the line starting at `pos`. */
const isActive = (state: EditorState, line: LineNode): boolean => (
  state.selection.from >= line.pos && state.selection.to <= line.pos + line.node.nodeSize
);

const decorationsFor = (state: EditorState): DecorationSet => {
  const lines = linesOf(state.doc);
  const decorations: Decoration[] = [];

  lines.forEach((line, index) => {
    // Inside the paragraph, after its last child. The markers then read as part
    // of the line, not as the start of the next one.
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
