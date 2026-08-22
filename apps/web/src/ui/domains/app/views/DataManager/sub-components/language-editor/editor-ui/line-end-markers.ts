/* @layer renderer-components @kind logic */
/**
 * The markers drawn at the END of a line, and nothing else there.
 *
 * A wait, a row return and a scroll are the codes a player actually experiences
 * — one stops the box until a button is pressed, the next puts the pen back at
 * the left edge of a row, the last shunts the box up a line to make room — and
 * all of them happen at a line's edge, never inside a sentence. So none is a
 * labelled chip in the run any more: a wait is an icon at the end of the line it
 * closes, and the advance is an icon at the end of the line the box moves on
 * FROM, which is where a reader experiences it even though the code belongs to
 * the line below.
 *
 * They are WIDGET DECORATIONS: no text, no size in the document, nothing the
 * caret can land in or a copy can carry out. Placement is automatic and follows
 * the line's own attributes, so a wait is never typed and never has to be found.
 * The symbols are the ones the read-only card draws, so a line reads the same
 * whether it is being edited or scanned.
 *
 * The wait is the affordance: clicking it turns the line's wait on or off. It is
 * drawn dim on whichever line the caret is in, so it can be found without
 * cluttering every other line with a control nobody asked for. The scroll is a
 * statement of fact and does nothing when pressed — the row a line lands on is
 * decided by the line structure, not by poking at it.
 *
 * Mousedown is swallowed so the click never moves the caret out of the text; the
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
const kWaitOn = 'Ends the box here — the player presses a button to go on. Click to remove.';
const kWaitOff = 'Click to end the box here, so the player presses a button before the next line.';
const kScroll = 'The box scrolls up a line before the next line is written.';

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
    // Inside the paragraph, after its last child — so the marker reads as part
    // of the line rather than as the start of the next one.
    const end = line.pos + line.node.nodeSize - 1;
    const on = endsBoxOfAttrs(line.node.attrs);

    if (on || isActive(state, line)) {
      decorations.push(Decoration.widget(
        end,
        (view) => waitDom(view, line.pos, on),
        { side: 1, key: `wait-${line.pos}-${on ? 'on' : 'off'}` },
      ));
    }

    const next = lines[index + 1];
    const marker = next === undefined ? null : advanceMarkerFor(advanceOfAttrs(next.node.attrs));
    if (marker !== null) {
      decorations.push(Decoration.widget(
        end,
        () => markerDom(marker.className, marker.title, marker.icon),
        { side: 1, key: `${marker.key}-${line.pos}` },
      ));
    }
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
