/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import {
  CLONE_STYLE, HOST_STYLE, naturalContentWidth, naturalContentWidths,
} from '@drizztdourden08/tessera/composites';

interface FakeDoc {
  body: FakeNode;
  createElement: (tag: string) => FakeNode;
}

interface FakeNode {
  box: number;
  content: number;
  styleText: string;
  children: FakeNode[];
  parent: FakeNode | null;
  ownerDocument: FakeDoc;
  setAttribute: (name: string, value: string) => void;
  appendChild: (child: FakeNode) => void;
  remove: () => void;
  cloneNode: (deep: boolean) => FakeNode;
  getBoundingClientRect: () => { width: number };
  readonly scrollWidth: number;
}

const isAttached = (node: FakeNode): boolean => {
  let current: FakeNode | null = node;
  while (current) {
    if (current === node.ownerDocument.body) return true;
    current = current.parent;
  }
  return false;
};

const makeNode = (ownerDocument: FakeDoc, box = 0, content = 0): FakeNode => {
  const node: FakeNode = {
    box,
    content,
    styleText: '',
    children: [],
    parent: null,
    ownerDocument,
    setAttribute: (name, value) => {
      if (name === 'style') node.styleText = value;
    },
    appendChild: (child) => {
      child.parent = node;
      node.children.push(child);
    },
    remove: () => {
      if (!node.parent) return;
      node.parent.children = node.parent.children.filter((other) => other !== node);
      node.parent = null;
    },
    cloneNode: () => makeNode(ownerDocument, box, content),
    getBoundingClientRect: () => {
      if (!isAttached(node)) return { width: 0 };
      return { width: node.styleText.includes('max-content') ? node.content : node.box };
    },
    get scrollWidth() {
      return Math.max(node.box, node.content);
    },
  };
  return node;
};

const makeDoc = (): FakeDoc => {
  const doc: FakeDoc = {
    body: null as unknown as FakeNode,
    createElement: () => makeNode(doc),
  };
  doc.body = makeNode(doc);
  return doc;
};

const asElement = (node: FakeNode): HTMLElement => node as unknown as HTMLElement;

const cellIn = (doc: FakeDoc, box: number, content: number): FakeNode => {
  const cell = makeNode(doc, box, content);
  doc.body.appendChild(cell);
  return cell;
};

describe('measuring what a clipped cell actually wants', () => {
  it('reports the content, not the roomy column the content is sitting in', () => {
    const doc = makeDoc();
    const cell = cellIn(doc, 320, 60);
    expect(naturalContentWidth(asElement(cell))).toBe(60);
  });

  it('is the answer the scroll width could not give, since that one just echoes the column', () => {
    const doc = makeDoc();
    const cell = cellIn(doc, 320, 60);
    expect(cell.scrollWidth).toBe(320);
    expect(naturalContentWidth(asElement(cell))).toBeLessThan(cell.scrollWidth);
  });

  it('still measures the whole of a value that IS spilling out of its column', () => {
    const doc = makeDoc();
    const cell = cellIn(doc, 320, 500);
    expect(naturalContentWidth(asElement(cell))).toBe(500);
  });

  it('rounds up, so an exact fit cannot clip a fraction of a glyph', () => {
    const doc = makeDoc();
    expect(naturalContentWidth(asElement(cellIn(doc, 320, 60.2)))).toBe(61);
  });

  it('measures a copy, and leaves the cell in the table exactly as it found it', () => {
    const doc = makeDoc();
    const cell = cellIn(doc, 320, 60);
    naturalContentWidth(asElement(cell));
    expect(cell.styleText).toBe('');
    expect(cell.parent).toBe(doc.body);
  });

  it('takes its host back down, so a measurement leaves nothing behind', () => {
    const doc = makeDoc();
    const cell = cellIn(doc, 320, 60);
    naturalContentWidth(asElement(cell));
    expect(doc.body.children).toEqual([cell]);
  });

  it('measures nothing at all when it is handed an empty column', () => {
    const doc = makeDoc();
    expect(naturalContentWidths([])).toEqual([]);
    expect(doc.body.children).toEqual([]);
  });
});

describe('measuring a whole column in one pass', () => {
  it('sizes every cell on its own content, in the order it was given them', () => {
    const doc = makeDoc();
    const cells = [60, 140, 500].map((content) => cellIn(doc, 320, content));
    expect(naturalContentWidths(cells.map(asElement))).toEqual([60, 140, 500]);
  });

  it('puts the whole batch up before reading any of it, and clears it after', () => {
    const doc = makeDoc();
    const cells = [60, 140].map((content) => cellIn(doc, 320, content));
    naturalContentWidths(cells.map(asElement));
    expect(doc.body.children).toEqual(cells);
  });

  it('agrees to the pixel with measuring one of those cells on its own', () => {
    const doc = makeDoc();
    const cells = [60, 140].map((content) => cellIn(doc, 320, content));
    const [, batched] = naturalContentWidths(cells.map(asElement));
    expect(batched).toBe(naturalContentWidth(asElement(cells[1])));
  });
});

describe('the styles the measurement depends on', () => {
  it('lets the copy size itself to its content, with no box left to fit inside', () => {
    expect(CLONE_STYLE).toContain('width: max-content');
    expect(CLONE_STYLE).toContain('max-width: none');
    expect(CLONE_STYLE).toContain('min-width: 0');
  });

  it('drops anything the original was carrying that would land in the width', () => {
    expect(CLONE_STYLE).toContain('transform: none');
    expect(CLONE_STYLE).toContain('display: block');
  });

  it('parks the host out of sight instead of hiding it, since it has to lay out', () => {
    expect(HOST_STYLE).toContain('position: fixed');
    expect(HOST_STYLE).toContain('visibility: hidden');
    expect(HOST_STYLE).not.toContain('display: none');
  });
});
