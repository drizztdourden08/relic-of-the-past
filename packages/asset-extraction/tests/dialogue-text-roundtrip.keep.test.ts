/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { formatDialogueText, parseDialogueText, dialogueTexts } from '@rotp/asset-extraction';

describe('dialogue text round-trip', () => {
  const asDecoded = (texts: string[]) => texts.map((text) => ({ text, srcData: [] }));

  it('parses ids and content back from a formatted dump', () => {
    const texts = [
      'Hello [Name]!',
      'Press [A] to continue.[Scroll]Then [B].',
      'Une porte secrète... [Waitkey]',
    ];
    const dump = formatDialogueText(asDecoded(texts));
    const parsed = parseDialogueText(dump);

    expect(parsed).toEqual([
      { id: 1, content: texts[0] },
      { id: 2, content: texts[1] },
      { id: 3, content: texts[2] },
    ]);
    expect(dialogueTexts(dump)).toEqual(texts);
  });

  it('preserves the injected control string for 396-string ROMs', () => {
    const texts = Array.from({ length: 396 }, (_, i) => `line ${i}`);
    const dump = formatDialogueText(asDecoded(texts));
    const parsed = parseDialogueText(dump);

    expect(parsed).toHaveLength(397);
    const injectedControlIndex = 4;
    expect(parsed[injectedControlIndex].content).toContain('[Number 00]');
    expect(parsed[0].content).toBe('line 0');
  });

  it('ignores blank trailing lines', () => {
    const dump = '1: first\n2: second\n';
    expect(parseDialogueText(dump)).toHaveLength(2);
  });
});
