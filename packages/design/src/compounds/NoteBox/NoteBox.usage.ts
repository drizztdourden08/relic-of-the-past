/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Free text a person wrote, such as a note or a changelog, shown in a sunken box that keeps its line breaks.',
  useWhen: ['A detail pane that shows a note, a changelog or a description exactly as typed.'],
  avoidWhen: [{ case: 'A short label or a value.', use: 'Text' }],
  rules: ['Pass the text as children; set accent to mark a note that needs attention.'],
  a11y: ['It is a paragraph of text; the accent is a border and carries no meaning of its own.'],
  buildingBlock: true,
  example: `import { NoteBox } from '@rotp/design';\n\nconst Note = () => <NoteBox>Fixed the castle door.</NoteBox>;\n`,
  propsHash: '095b71fe0cbb951c',
} satisfies ComponentUsage;

export { usage };
